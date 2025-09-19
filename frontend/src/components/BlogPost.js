import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GradualBlur from './GradualBlur';
import { blogData } from '../data/mockData';

gsap.registerPlugin(ScrollTrigger);

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [estimatedReadingTime, setEstimatedReadingTime] = useState(0);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const blog = blogData.find(post => post.id === parseInt(id));

  useEffect(() => {
    if (!blog) {
      navigate('/blog');
      return;
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Initialize like count and comments
    setLikeCount(blog.likes);
    setComments([
      {
        id: 1,
        author: "Sarah Chen",
        avatar: "SC",
        content: "Great insights! This really helped me understand the complexities of digital licensing.",
        timestamp: "2 hours ago",
        likes: 12
      },
      {
        id: 2,
        author: "Michael Torres",
        avatar: "MT",
        content: "I've been implementing some of these strategies in my own business. The results are promising so far.",
        timestamp: "1 day ago",
        likes: 8
      },
      {
        id: 3,
        author: "Elena Rodriguez",
        avatar: "ER",
        content: "The section on risk management was particularly valuable. Would love to see more content on this topic.",
        timestamp: "3 days ago",
        likes: 15
      }
    ]);

    // Reading progress tracker
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', updateReadingProgress);

    // Entrance animations
    gsap.fromTo(contentRef.current, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    // Calculate reading time
    const wordsPerMinute = 200;
    const wordCount = blog.content.split(' ').length + blog.excerpt.split(' ').length;
    setEstimatedReadingTime(Math.ceil(wordCount / wordsPerMinute));

    return () => {
      window.removeEventListener('scroll', updateReadingProgress);
    };
  }, [blog, navigate]);

  const shareArticle = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(blog.title);
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${url}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const relatedPosts = blogData
    .filter(post => post.id !== blog.id && (post.category === blog.category || post.tags?.some(tag => blog.tags?.includes(tag))))
    .slice(0, 3);

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
              JR
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Julian Rozario
            </span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/blog')}
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              ← Back to Blog
            </button>
            
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4">
        <div className="absolute inset-0">
          <img 
            src={blog.image} 
            alt={blog.title}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20">
                {blog.category}
              </span>
              {blog.featured && (
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20">
                  ⭐ Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              {blog.title}
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl">
              {blog.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  JR
                </div>
                <div>
                  <div className="text-white font-medium">{blog.author}</div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>{estimatedReadingTime} min read</span>
                    <span>{blog.views} views</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => shareArticle('twitter')}
                  className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors duration-300"
                  title="Share on Twitter"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57C23.099 4.946 22.192 5.21 21.253 5.35C22.218 4.791 22.954 3.904 23.307 2.853C22.396 3.372 21.396 3.745 20.357 3.954C19.487 3.076 18.281 2.55 16.964 2.55C14.455 2.55 12.427 4.578 12.427 7.087C12.427 7.458 12.472 7.818 12.558 8.163C8.784 7.967 5.488 6.188 3.302 3.435C2.896 4.116 2.665 4.904 2.665 5.749C2.665 7.336 3.473 8.73 4.717 9.548C3.971 9.524 3.274 9.318 2.665 8.97V9.032C2.665 11.233 4.208 13.067 6.291 13.501C5.894 13.609 5.477 13.666 5.047 13.666C4.746 13.666 4.454 13.637 4.168 13.583C4.762 15.383 6.413 16.681 8.387 16.717C6.856 17.921 4.928 18.634 2.83 18.634C2.449 18.634 2.074 18.612 1.708 18.568C3.703 19.838 6.078 20.573 8.626 20.573C16.954 20.573 21.5 13.74 21.5 7.638C21.5 7.435 21.495 7.234 21.486 7.034C22.408 6.395 23.209 5.596 23.954 4.622L23.953 4.57Z"/>
                  </svg>
                </button>
                
                <button 
                  onClick={() => shareArticle('linkedin')}
                  className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-600/10 transition-colors duration-300"
                  title="Share on LinkedIn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z"/>
                  </svg>
                </button>
                
                <button 
                  onClick={() => shareArticle('facebook')}
                  className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors duration-300"
                  title="Share on Facebook"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.564H7.078V12.073H10.125V9.405C10.125 6.348 11.917 4.697 14.658 4.697C15.971 4.697 17.344 4.922 17.344 4.922V7.875H15.83C14.34 7.875 13.875 8.8 13.875 9.75V12.073H17.203L16.671 15.564H13.875V24C19.612 23.094 24 18.1 24 12.073Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article ref={contentRef} className="relative py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="prose prose-lg prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed space-y-6">
                {/* Simulated article content */}
                <p className="text-xl font-medium text-white mb-8">
                  {blog.content}
                </p>
                
                <div className="grid md:grid-cols-2 gap-8 my-12">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-purple-300 mb-4">Key Takeaways</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Strategic planning drives sustainable growth</li>
                      <li>• Data-driven decisions improve outcomes</li>
                      <li>• Implementation requires systematic approach</li>
                    </ul>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-blue-300 mb-4">Quick Stats</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• 85% success rate in implementations</li>
                      <li>• 3x ROI improvement on average</li>
                      <li>• 6-month typical timeline</li>
                    </ul>
                  </div>
                </div>

                <p>
                  In today's rapidly evolving business landscape, companies must adapt quickly to remain competitive. This comprehensive approach to strategic planning ensures that organizations can navigate challenges while capitalizing on emerging opportunities.
                </p>

                <blockquote className="border-l-4 border-purple-500 bg-white/5 p-6 rounded-r-2xl my-8">
                  <p className="text-lg italic text-gray-200 mb-4">
                    "Success in business requires training and discipline and hard work. But if you're not frightened by these things, the opportunities are just as great today as they ever were."
                  </p>
                  <cite className="text-purple-300 font-medium">— David Rockefeller</cite>
                </blockquote>

                <p>
                  The methodology outlined in this article has been successfully implemented across various industries, from technology startups to established manufacturing companies. Each implementation is customized to address specific organizational needs and market conditions.
                </p>

                <h2 className="text-2xl font-bold text-white mt-12 mb-6">Implementation Framework</h2>
                
                <p>
                  Our proven framework consists of five key phases that ensure successful execution and sustainable results. Each phase builds upon the previous one, creating momentum and buy-in throughout the organization.
                </p>

                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8 my-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Phase 1: Assessment & Analysis</h3>
                  <p className="text-gray-300">
                    Comprehensive evaluation of current state, market position, and competitive landscape to identify opportunities and challenges.
                  </p>
                </div>

                <p>
                  The remaining phases focus on strategic development, implementation planning, execution, and continuous monitoring to ensure long-term success.
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags?.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-purple-300 hover:border-purple-500/30 transition-colors duration-300 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  JR
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Julian D Rozario</h3>
                  <p className="text-gray-300 mb-4">
                    Business Consultant & Licensing Advisor with over 8 years of experience helping companies achieve sustainable growth through strategic planning and innovative licensing solutions.
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="text-purple-400 hover:text-purple-300 transition-colors duration-300">
                      Follow on LinkedIn →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="relative py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article 
                  key={relatedPost.id}
                  onClick={() => navigate(`/blog/${relatedPost.id}`)}
                  className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={relatedPost.image} 
                      alt={relatedPost.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-gray-400 mb-2">{relatedPost.category}</div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                      {relatedPost.excerpt}
                    </p>
                    <div className="text-xs text-gray-400">
                      {new Date(relatedPost.date).toLocaleDateString()} • {relatedPost.readTime}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gradual blur at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <GradualBlur
          position="bottom"
          height="6rem"
          strength={2}
          divCount={6}
          opacity={0.6}
        />
      </div>
    </div>
  );
};

export default BlogPost;