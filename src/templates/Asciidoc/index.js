import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import hljs from 'highlight.js';
import styled from 'styled-components';
import 'highlight.js/styles/github.css';
import { graphql } from 'gatsby';
import Container from '@material-ui/core/Container';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Content from './components/Content';

const SectionLink = styled.a`
  color: #333333;
  position: relative;

  &:hover {
    color: #000000;
    text-decoration: none;
  }

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #666666;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10000;
    transform: translate(-16px, 6px);
    border-radius: 50%;
    opacity: ${({ style: { isActive } }) => isActive ? 1 : 0};
    transition: all 0.2s ease-in-out;
  }
`;

const SubSectionLink = styled.a`
  color: #333333;
  margin-left: 16px;
  position: relative;

  &:hover {
    color: #000000;
    text-decoration: none;
  }

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #666666;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10000;
    transform: translate(-16px, 6px);
    border-radius: 50%;
    opacity: ${({ style: { isActive } }) => isActive ? 1 : 0};
    transition: all 0.2s ease-in-out;
  }
`;

const StyledContainer = styled(Container)`
  display: flex;
`;

const TOC = styled.div`
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
  color: #999999;
`;

const Nav = styled.div`
  position: fixed;
  top: 72px;
  right: 16px;
  width: 296px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 108px);
  overflow: auto;

  > * {
    margin-bottom: 8px;
  }
`;

export const query = graphql`
  query($id: String!) {
    asciidoc(id: { eq: $id }) {
      html
      document {
        title
        subtitle
        main
      }
    }
    allAsciidoc {
      edges {
        node {
          id
          html
          document {
            title
          }
          pageAttributes {
            slug
          }
        }
      }
    }
  }
`;

const Asciidoc = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  const [sections, setSections] = useState([]);

  const resolveTitleFromSlug = (slug) => {
    const match = props.data.allAsciidoc.edges.map(({ node }) => node).find(({ pageAttributes: { slug: s } = {} }) => s === slug);
    if (match) return match.document.title;

    return null;
  };

  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });

    document.querySelectorAll('a[data-slug]').forEach((elem) => {
      const { slug } = elem.dataset;
      // eslint-disable-next-line no-param-reassign
      if (slug) elem.innerText = resolveTitleFromSlug(slug) || elem.innerText;
    });
  }, []);

  useEffect(() => {
    const elem = document.createElement('html');
    elem.innerHTML = props.data.asciidoc.html;

    const headers = elem.querySelectorAll('h2,h3');
    const mappedSections = Array.from(headers).map((header) => ({
      href: header.id,
      text: header.innerText,
      type: header.localName,
    }));

    elem.remove();

    setSections(mappedSections);
  }, []);

  const renderTextFromHref = (href, text) => {
    if (href[0] === '_') {
      return text;
    }

    return href;
  };

  return (
    <StyledContainer maxWidth="lg">
      <Helmet>
        <title>{`${props.data.asciidoc.document.title} | Koji for Developers`}</title>
      </Helmet>
      <Content
        dangerouslySetInnerHTML={{ __html: props.data.asciidoc.html }}
        style={{ isMobile }}
      />
      {
        !isMobile && sections.length > 0 &&
        <Nav>
          <TOC>{'Table of Contents'}</TOC>
          {
            sections.map(({ href, text, type }) => {
              if (type === 'h2') {
                return (
                  <SectionLink
                    style={{ isActive: href === props.currentHeader }}
                    href={`#${href}`}
                    key={href}
                  >
                    {renderTextFromHref(href, text)}
                  </SectionLink>
                );
              }
              return (
                <SubSectionLink
                  style={{ isActive: href === props.currentHeader }}
                  href={`#${href}`}
                  key={href}
                >
                  {renderTextFromHref(href, text)}
                </SubSectionLink>
              );
            })
          }
        </Nav>
      }
    </StyledContainer>
  );
};

Asciidoc.propTypes = {
  currentHeader: PropTypes.string,
  data: PropTypes.object,
};

Asciidoc.defaultProps = {
  currentHeader: null,
  data: {},
};

export default Asciidoc;
