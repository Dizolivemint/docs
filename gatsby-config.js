/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

const asciidoc = require('asciidoctor')();
const { resolvePathFromSlug } = require('./src/utils/resolvePathFromSlug');

class TemplateConverter {
  constructor() {
    // Use default html5 converter
    this.baseConverter = asciidoc.Html5Converter.$new();
  }

  convert(node, transform) {
    // Convert inline_anchors to support linking to slugs
    if (node.getNodeName() === 'inline_anchor') {
      const target = node.getTarget();
      const text = node.getText();

      if (!target.includes('/') && target.includes('.html')) {
        // Remove the automatically appended .html
        const newTarget = target.replace('.html', '');

        // If the slug has a hash, then it means we are deep linking and need
        // to split off the slug
        const slug = newTarget.includes('#') ? newTarget.split('#')[0] : newTarget;

        // Get the resolved path
        const resolvedPath = resolvePathFromSlug(slug);

        // Set our href
        const href = newTarget.includes('#') ? `${resolvedPath}#${newTarget.split('#')[1]}` : resolvedPath;

        // If there is provided text, we'll use that by default
        if (text) return `<a href="${href}">${text}</a>`;

        // If there is no default text, we'll return the target by default
        // and attach a data-attribute that we can target in the client
        //
        // We'll use getTitleFromSlug to replace the innerText of the a element
        return `<a data-slug="${slug}" href="${href}">${target}</a>`;
      }

      // If the target includes the http protocol, automatically open in a new tab/window
      if (target.includes('http')) {
        return `<a href="${target}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
    }

    return this.baseConverter.convert(node, transform);
  }
}

module.exports = {
  /* Your site config here */
  siteMetadata: {},

  plugins: [
    // Support a default layout component that won't unmount between route changes
    'gatsby-plugin-layout',

    // Material styles
    'gatsby-plugin-material-ui',

    // Asciidoc transformer
    {
      resolve: 'gatsby-transformer-asciidoc',
      options: {
        safe: 'unsafe',
        attributes: {
          showtitle: true,
          imagesdir: '/images',
        },
        converterFactory: TemplateConverter,
      },
    },

    // Support filesystem
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: `${__dirname}/src`,
      },
    },

    // Automatically catch links and make them work with SPA
    'gatsby-plugin-catch-links',

    // Styled components (prevent fouc)
    'gatsby-plugin-styled-components',

    // Analytics
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        // The property ID; the tracking code won't be generated without it
        trackingId: 'UA-136955953-1',
        // Defines where to place the tracking script - `true` in the head and `false` in the body
        head: true,
      },
    },
  ],
};
