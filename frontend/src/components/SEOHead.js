import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Head Component
 * Dynamically sets meta tags for SEO optimization
 */
const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  canonicalUrl,
  author = "Julian D'Rozario",
  type = "article",
  publishedTime,
  modifiedTime
}) => {
  // Get the current URL
  const currentUrl = window.location.href;
  const baseUrl = window.location.origin;
  
  // Build full URLs
  const fullCanonicalUrl = canonicalUrl 
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${baseUrl}${canonicalUrl}`)
    : currentUrl;
  
  const fullOgImage = ogImage 
    ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`)
    : `${baseUrl}/default-og-image.jpg`;

  // Default values
  const defaultTitle = "Julian D'Rozario - Business Consultant & Portfolio";
  const defaultDescription = "Expert business consultant specializing in Dubai company formation, UAE business setup, and corporate services.";
  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Julian D'Rozario Portfolio" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      <meta property="article:author" content={author} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:creator" content="@juliandrozario" />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      
      {/* Structured Data for Articles */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": finalTitle,
            "description": finalDescription,
            "image": fullOgImage,
            "author": {
              "@type": "Person",
              "name": author
            },
            "publisher": {
              "@type": "Organization",
              "name": "Julian D'Rozario",
              "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`
              }
            },
            "datePublished": publishedTime,
            "dateModified": modifiedTime || publishedTime,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": fullCanonicalUrl
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
