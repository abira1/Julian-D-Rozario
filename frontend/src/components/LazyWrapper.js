import React, { Suspense, lazy } from 'react';
import { LoadingSpinner, SkeletonLoader } from './LoadingSystem';

// Lazy load components with enhanced error boundaries and loading states
export const createLazyComponent = (importFunc, fallback = null, displayName = 'LazyComponent') => {
  const LazyComponent = lazy(importFunc);
  
  const WrappedComponent = (props) => (
    <Suspense 
      fallback={
        fallback || (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="medium" color="purple" />
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
  
  WrappedComponent.displayName = displayName;
  return WrappedComponent;
};

// Lazy components for better initial page load performance
export const LazyContactSection = createLazyComponent(
  () => import('./ContactSection'),
  <div className="py-20">
    <SkeletonLoader type="text" count={3} />
  </div>
);

export const LazyFooter = createLazyComponent(
  () => import('./Footer'),
  <div className="py-12">
    <SkeletonLoader type="text" count={2} />
  </div>
);

export const LazyBlogSection = createLazyComponent(
  () => import('./PremiumBlogSection'),
  <div className="py-20">
    <SkeletonLoader type="blog-card" count={6} />
  </div>
);

// Admin panel components - lazy loaded since they're not needed on initial page load
export const LazyAdminPanel = createLazyComponent(
  () => import('./AdminPanel'),
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <LoadingSpinner size="large" color="purple" />
      <p className="text-gray-300">Loading Admin Panel...</p>
    </div>
  </div>
);

export const LazyBlogListing = createLazyComponent(
  () => import('./BlogListing'),
  <div className="py-20">
    <SkeletonLoader type="blog-card" count={8} />
  </div>
);

export const LazyBlogPost = createLazyComponent(
  () => import('./BlogPost'),
  <div className="py-20">
    <div className="max-w-4xl mx-auto">
      <SkeletonLoader type="image" count={1} />
      <div className="mt-8">
        <SkeletonLoader type="text" count={10} />
      </div>
    </div>
  </div>
);

export const LazyPremiumBlogListing = createLazyComponent(
  () => import('./PremiumBlogListing'),
  <div className="py-20">
    <SkeletonLoader type="blog-card" count={8} />
  </div>
);

export const LazyPremiumBlogPost = createLazyComponent(
  () => import('./PremiumBlogPost'),
  <div className="py-20">
    <div className="max-w-4xl mx-auto">
      <SkeletonLoader type="image" count={1} />
      <div className="mt-8">
        <SkeletonLoader type="text" count={10} />
      </div>
    </div>
  </div>
);

export default {
  LazyContactSection,
  LazyFooter,
  LazyBlogSection,
  LazyAdminPanel,
  LazyBlogListing,
  LazyBlogPost,
  LazyPremiumBlogListing,
  LazyPremiumBlogPost
};