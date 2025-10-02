import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

// Global loading spinner component with smooth animations
export const LoadingSpinner = ({ size = 'medium', color = 'purple' }) => {
  const spinnerRef = useRef(null);

  useEffect(() => {
    if (spinnerRef.current) {
      gsap.fromTo(spinnerRef.current, 
        { rotation: 0, opacity: 0, scale: 0.8 },
        { 
          rotation: 360, 
          opacity: 1, 
          scale: 1,
          duration: 1.5, 
          ease: "power2.out",
          repeat: -1,
          transformOrigin: "center center"
        }
      );
    }
  }, []);

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const colorClasses = {
    purple: 'border-purple-500 border-t-purple-200',
    blue: 'border-blue-500 border-t-blue-200',
    white: 'border-white border-t-gray-400'
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        ref={spinnerRef}
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-4 rounded-full animate-spin
        `}
      />
    </div>
  );
};

// Skeleton loader for content placeholders
export const SkeletonLoader = ({ type = 'text', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => {
    switch (type) {
      case 'blog-card':
        return (
          <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse">
            <div className="bg-white/10 h-48 rounded-lg mb-4"></div>
            <div className="bg-white/10 h-4 rounded mb-2"></div>
            <div className="bg-white/10 h-3 rounded w-3/4 mb-4"></div>
            <div className="bg-white/10 h-3 rounded w-1/2"></div>
          </div>
        );
      case 'text':
        return (
          <div key={i} className="space-y-2">
            <div className="bg-white/10 h-4 rounded animate-pulse"></div>
            <div className="bg-white/10 h-4 rounded w-5/6 animate-pulse"></div>
            <div className="bg-white/10 h-4 rounded w-4/5 animate-pulse"></div>
          </div>
        );
      case 'image':
        return (
          <div key={i} className="bg-white/10 aspect-video rounded-lg animate-pulse"></div>
        );
      default:
        return (
          <div key={i} className="bg-white/10 h-20 rounded animate-pulse"></div>
        );
    }
  });

  return <div className="space-y-4">{skeletons}</div>;
};

// Progressive image loader with blur-to-clear effect
export const ProgressiveImage = ({ 
  src, 
  alt, 
  className = '',
  blurDataURL = null,
  onLoad = () => {},
  priority = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad();
    
    // Smooth fade-in animation
    if (imgRef.current) {
      gsap.fromTo(imgRef.current,
        { opacity: 0, filter: 'blur(8px)', scale: 1.02 },
        { 
          opacity: 1, 
          filter: 'blur(0px)', 
          scale: 1,
          duration: 0.8, 
          ease: "power2.out" 
        }
      );
    }
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder with blur effect */}
      {(!isLoaded || !isVisible) && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 animate-pulse" />
      )}
      
      {/* Progressive image loading */}
      {isVisible && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
};

// Page transition wrapper with smooth animations
export const PageTransition = ({ children, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          ease: "power2.out" 
        }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Intersection observer hook for triggering animations
export const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};

// Smooth section transition with stagger animations
export const SectionTransition = ({ children, delay = 0 }) => {
  const [ref, isInView] = useInView();
  const elementsRef = useRef([]);

  useEffect(() => {
    if (isInView && elementsRef.current.length > 0) {
      gsap.fromTo(elementsRef.current,
        { 
          opacity: 0, 
          y: 30,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          delay: delay,
          ease: "power2.out"
        }
      );
    }
  }, [isInView, delay]);

  return (
    <div ref={ref}>
      {React.Children.map(children, (child, index) => (
        <div
          ref={el => elementsRef.current[index] = el}
          className="opacity-0"
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Preloader for critical resources
export const ResourcePreloader = ({ resources = [], onComplete = () => {} }) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (resources.length === 0) {
      onComplete();
      return;
    }

    let loaded = 0;
    const promises = resources.map(resource => {
      return new Promise((resolve) => {
        if (resource.type === 'image') {
          const img = new Image();
          img.onload = () => {
            loaded++;
            setLoadedCount(loaded);
            resolve();
          };
          img.onerror = resolve; // Continue even if image fails
          img.src = resource.src;
        } else if (resource.type === 'font') {
          // Font preloading
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'font';
          link.href = resource.src;
          link.onload = () => {
            loaded++;
            setLoadedCount(loaded);
            resolve();
          };
          link.onerror = resolve;
          document.head.appendChild(link);
        } else {
          // Generic resource preloading
          fetch(resource.src)
            .then(() => {
              loaded++;
              setLoadedCount(loaded);
              resolve();
            })
            .catch(resolve);
        }
      });
    });

    Promise.all(promises).then(() => {
      setIsComplete(true);
      setTimeout(onComplete, 100); // Small delay for smooth transition
    });
  }, [resources, onComplete]);

  const progress = resources.length > 0 ? (loadedCount / resources.length) * 100 : 100;

  return {
    progress,
    isComplete,
    loadedCount,
    totalCount: resources.length
  };
};

// Profile-based loading screen component for Julian D'Rozario
export const ProfileLoadingScreen = ({ 
  isLoading, 
  progress = null, 
  showProgress = false 
}) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (overlayRef.current && isLoading) {
      gsap.set(overlayRef.current, { opacity: 1, pointerEvents: 'all' });
      
      // Profile image animation
      gsap.fromTo(profileRef.current,
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
      
      // Content animation
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
      );
    } else if (overlayRef.current && !isLoading) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(overlayRef.current, { pointerEvents: 'none' });
        }
      });
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/10 to-black z-50 flex items-center justify-center"
    >
      <div className="text-center space-y-8 max-w-md">
        {/* Profile Section */}
        <div ref={profileRef} className="relative">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            {/* Profile placeholder with initials */}
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/25">
              <span className="text-4xl font-bold text-white" 
                    style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                JD'R
              </span>
            </div>
            
            {/* Animated glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 animate-pulse"></div>
            <div className="absolute -inset-2 rounded-full border-2 border-purple-400/30 animate-spin" style={{ animationDuration: '3s' }}></div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2" 
              style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
            Julian D'Rozario
          </h2>
          
          <p className="text-purple-300 text-lg font-medium">
            Business Relations Manager
          </p>
          <p className="text-gray-400">
            Company Formation Specialist
          </p>
        </div>

        {/* Loading Content */}
        <div ref={contentRef} className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="medium" color="purple" />
            <span className="text-gray-300 animate-pulse">
              Preparing your experience...
            </span>
          </div>
          
          {showProgress && progress !== null && (
            <div className="w-80 bg-white/10 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main loading screen component (kept for backward compatibility)
export const LoadingScreen = ({ 
  isLoading, 
  progress = null, 
  message = "Loading...",
  showProgress = false 
}) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (overlayRef.current) {
      if (isLoading) {
        gsap.set(overlayRef.current, { opacity: 1, pointerEvents: 'all' });
        gsap.fromTo(contentRef.current,
          { opacity: 0, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      } else {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(overlayRef.current, { pointerEvents: 'none' });
          }
        });
      }
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div ref={contentRef} className="text-center space-y-6">
        <LoadingSpinner size="large" color="purple" />
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white" 
              style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
            {message}
          </h3>
          
          {showProgress && progress !== null && (
            <>
              <div className="w-64 bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-gray-300 text-sm">
                {Math.round(progress)}% complete
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLoadingScreen;