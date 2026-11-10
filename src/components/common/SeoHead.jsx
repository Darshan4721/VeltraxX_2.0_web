import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSeoData, BASE_URL, DEFAULT_OG_IMAGE } from '../../data/seoData';

/**
 * SeoHead component manages dynamic document head metadata and Schema.org JSON-LD structured data.
 * Leverages React 19 native document head tag hoisting and synchronizes runtime DOM nodes on route transition.
 * 
 * @param {object} props
 * @param {string} [props.route] Explicit route path (e.g. '/', '/about'). If omitted, falls back to useLocation().pathname.
 */
export default function SeoHead({ route }) {
  let locationPath = '/';
  try {
    const location = useLocation();
    locationPath = location?.pathname || '/';
  } catch {
    locationPath = '/';
  }

  const activeRoute = route || locationPath;
  const seo = getSeoData(activeRoute);

  useEffect(() => {
    // 1. Update Document Title
    if (seo.title) {
      document.title = seo.title;
    }

    // 2. Helper to set or create meta tag
    const setMeta = (selector, attr, attrVal, content) => {
      if (!content) return;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, attrVal);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 3. Helper to set or create link tag
    const setLink = (rel, href) => {
      if (!href) return;
      let tag = document.querySelector(`link[rel="${rel}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', href);
    };

    // Synchronize Standard Meta
    setMeta('meta[name="description"]', 'name', 'description', seo.description);
    setMeta('meta[name="keywords"]', 'name', 'keywords', seo.keywords);
    setLink('canonical', seo.canonical);

    // Synchronize Open Graph
    setMeta('meta[property="og:title"]', 'property', 'og:title', seo.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', seo.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', seo.canonical);
    setMeta('meta[property="og:image"]', 'property', 'og:image', seo.ogImage || DEFAULT_OG_IMAGE);
    setMeta('meta[property="og:type"]', 'property', 'og:type', seo.ogType || 'website');
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'VELTRAXX 2.0');
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'en_IN');

    // Synchronize Twitter Cards
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', seo.twitterCard || 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', seo.ogImage || DEFAULT_OG_IMAGE);

    // Synchronize JSON-LD Schema
    if (seo.schemas && seo.schemas.length > 0) {
      let scriptTag = document.getElementById('dynamic-seo-jsonld');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-seo-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      const schemaGraph = {
        '@context': 'https://schema.org',
        '@graph': seo.schemas
      };
      scriptTag.textContent = JSON.stringify(schemaGraph);
    }
  }, [seo]);

  // React 19 native document metadata hoisting
  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      <link rel="canonical" href={seo.canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={seo.ogType || 'website'} />
      <meta property="og:site_name" content="VELTRAXX 2.0" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:url" content={seo.canonical} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.ogImage || DEFAULT_OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content={seo.twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.ogImage || DEFAULT_OG_IMAGE} />
    </>
  );
}
