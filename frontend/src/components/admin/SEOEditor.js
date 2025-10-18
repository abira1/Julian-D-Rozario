import React, { useState, useEffect, useRef } from 'react';
import { Globe, Search, Share2, Tag, AlertCircle, CheckCircle2, Link as LinkIcon, FileText } from 'lucide-react';

const SEOEditor = ({ formData, onUpdate }) => {
  const [seoData, setSeoData] = useState({
    slug: formData.slug || '',
    meta_title: formData.meta_title || '',
    meta_description: formData.meta_description || '',
    keywords: formData.keywords || '',
    og_image: formData.og_image || '',
    canonical_url: formData.canonical_url || ''
  });

  const [autoGenerate, setAutoGenerate] = useState(true);
  
  // Use ref to track if we've initialized
  const isInitialized = useRef(false);

  // Auto-generate SEO fields from blog content
  useEffect(() => {
    if (autoGenerate) {
      const generateSlug = (title) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      };

      setSeoData(prev => ({
        ...prev,
        slug: prev.slug || generateSlug(formData.title || ''),
        meta_title: prev.meta_title || formData.title?.substring(0, 60) || '',
        meta_description: prev.meta_description || formData.excerpt?.substring(0, 160) || '',
        keywords: prev.keywords || formData.category || '',
        canonical_url: prev.canonical_url || `/blog/${generateSlug(formData.title || '')}`
      }));
    }
  }, [formData.title, formData.excerpt, formData.category, autoGenerate]);

  // Update parent component only when seoData actually changes
  // Note: We intentionally omit onUpdate from dependencies to prevent infinite loop
  // since onUpdate is memoized with useCallback in parent component
  const prevSeoDataRef = useRef();
  useEffect(() => {
    // Only call onUpdate if data actually changed
    if (prevSeoDataRef.current !== undefined) {
      const hasChanged = JSON.stringify(prevSeoDataRef.current) !== JSON.stringify(seoData);
      if (hasChanged) {
        onUpdate(seoData);
      }
    }
    prevSeoDataRef.current = seoData;
  }, [seoData, onUpdate]);

  const handleChange = (field, value) => {
    setSeoData(prev => ({ ...prev, [field]: value }));
    if (field !== 'slug') {
      setAutoGenerate(false);
    }
  };

  // Character count helpers
  const getCharacterCountClass = (current, max, optimal) => {
    if (current === 0) return 'text-gray-500';
    if (current < optimal) return 'text-yellow-500';
    if (current <= max) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusIcon = (current, max, optimal) => {
    if (current === 0) return <AlertCircle className="w-4 h-4 text-gray-500" />;
    if (current < optimal || current > max) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl p-6 border border-purple-500/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Search className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">SEO Optimization</h3>
            <p className="text-sm text-gray-400">Improve your blog's search engine visibility</p>
          </div>
        </div>
        <button
          onClick={() => setAutoGenerate(!autoGenerate)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            autoGenerate
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-slate-700 text-gray-300 border border-slate-600'
          }`}
        >
          {autoGenerate ? '🤖 Auto-Generate ON' : '✍️ Manual Mode'}
        </button>
      </div>

      {/* Google Search Preview */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
          <Globe className="w-4 h-4 mr-2 text-blue-400" />
          Google Search Preview
        </h4>
        <div className="bg-white rounded-lg p-4 space-y-2">
          <div className="text-xs text-gray-600">
            yourdomain.com › blog › {seoData.slug || 'your-blog-post'}
          </div>
          <div className="text-xl text-blue-600 hover:underline cursor-pointer font-medium">
            {seoData.meta_title || formData.title || 'Your Blog Title Here'}
          </div>
          <div className="text-sm text-gray-700 line-clamp-2">
            {seoData.meta_description || formData.excerpt || 'Your blog description will appear here...'}
          </div>
        </div>
      </div>

      {/* URL Slug */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-semibold text-white">
          <LinkIcon className="w-4 h-4 mr-2 text-purple-400" />
          URL Slug *
        </label>
        <input
          type="text"
          value={seoData.slug}
          onChange={(e) => handleChange('slug', e.target.value)}
          placeholder="your-blog-post-url"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400">
          💡 Use lowercase letters, numbers, and hyphens only. This appears in your URL.
        </p>
      </div>

      {/* Meta Title */}
      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-semibold text-white">
          <span className="flex items-center">
            <Search className="w-4 h-4 mr-2 text-purple-400" />
            Meta Title *
          </span>
          <span className="flex items-center space-x-2">
            {getStatusIcon(seoData.meta_title.length, 60, 50)}
            <span className={getCharacterCountClass(seoData.meta_title.length, 60, 50)}>
              {seoData.meta_title.length}/60
            </span>
          </span>
        </label>
        <input
          type="text"
          value={seoData.meta_title}
          onChange={(e) => handleChange('meta_title', e.target.value)}
          placeholder="Compelling title for search results (50-60 characters)"
          maxLength={60}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400">
          💡 Optimal length: 50-60 characters. Include your main keyword.
        </p>
      </div>

      {/* Meta Description */}
      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-semibold text-white">
          <span className="flex items-center">
            <FileText className="w-4 h-4 mr-2 text-purple-400" />
            Meta Description *
          </span>
          <span className="flex items-center space-x-2">
            {getStatusIcon(seoData.meta_description.length, 160, 150)}
            <span className={getCharacterCountClass(seoData.meta_description.length, 160, 150)}>
              {seoData.meta_description.length}/160
            </span>
          </span>
        </label>
        <textarea
          value={seoData.meta_description}
          onChange={(e) => handleChange('meta_description', e.target.value)}
          placeholder="Brief description that appears in search results (150-160 characters)"
          maxLength={160}
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400">
          💡 Optimal length: 150-160 characters. Make it compelling and include keywords.
        </p>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-semibold text-white">
          <Tag className="w-4 h-4 mr-2 text-purple-400" />
          Keywords
        </label>
        <input
          type="text"
          value={seoData.keywords}
          onChange={(e) => handleChange('keywords', e.target.value)}
          placeholder="keyword1, keyword2, keyword3 (5-10 keywords)"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400">
          💡 Separate with commas. Use 5-10 relevant keywords.
        </p>
      </div>

      {/* OG Image */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-semibold text-white">
          <Share2 className="w-4 h-4 mr-2 text-purple-400" />
          Open Graph Image (Social Media)
        </label>
        <input
          type="url"
          value={seoData.og_image}
          onChange={(e) => handleChange('og_image', e.target.value)}
          placeholder="https://example.com/image.jpg (1200x630px recommended)"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {seoData.og_image && (
          <div className="mt-2">
            <img
              src={seoData.og_image}
              alt="OG Preview"
              className="w-full max-w-md rounded-lg border border-slate-600"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        <p className="text-xs text-gray-400">
          💡 Recommended size: 1200x630px. This image appears when sharing on social media.
        </p>
      </div>

      {/* Canonical URL */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-semibold text-white">
          <Globe className="w-4 h-4 mr-2 text-purple-400" />
          Canonical URL
        </label>
        <input
          type="text"
          value={seoData.canonical_url}
          onChange={(e) => handleChange('canonical_url', e.target.value)}
          placeholder="/blog/your-post-slug"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400">
          💡 The preferred URL for this content. Helps prevent duplicate content issues.
        </p>
      </div>

      {/* SEO Score */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
        <h4 className="text-sm font-semibold text-white mb-3">SEO Checklist</h4>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center ${seoData.slug ? 'text-green-400' : 'text-gray-400'}`}>
            {seoData.slug ? '✅' : '⬜'} URL slug is set
          </div>
          <div className={`flex items-center ${seoData.meta_title.length >= 50 && seoData.meta_title.length <= 60 ? 'text-green-400' : 'text-gray-400'}`}>
            {seoData.meta_title.length >= 50 && seoData.meta_title.length <= 60 ? '✅' : '⬜'} Meta title is optimal (50-60 chars)
          </div>
          <div className={`flex items-center ${seoData.meta_description.length >= 150 && seoData.meta_description.length <= 160 ? 'text-green-400' : 'text-gray-400'}`}>
            {seoData.meta_description.length >= 150 && seoData.meta_description.length <= 160 ? '✅' : '⬜'} Meta description is optimal (150-160 chars)
          </div>
          <div className={`flex items-center ${seoData.keywords ? 'text-green-400' : 'text-gray-400'}`}>
            {seoData.keywords ? '✅' : '⬜'} Keywords are added
          </div>
          <div className={`flex items-center ${seoData.og_image ? 'text-green-400' : 'text-gray-400'}`}>
            {seoData.og_image ? '✅' : '⬜'} Social media image is set
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOEditor;
