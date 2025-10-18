import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./contexts/AuthContext";
import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection"; // Original version with finalized positions
import AboutSection from "./components/AboutSection";
// WorkedWithSection removed as requested

// Import loading system components
import { PageTransition } from "./components/LoadingSystem";

// Import skeleton loaders
import {
  HeroSectionSkeleton,
  BlogSectionSkeleton,
  AboutSectionSkeleton,
  ContactSectionSkeleton
} from "./components/SkeletonLoaders";

// Lazy load non-critical components for better performance
import { 
  LazyContactSection,
  LazyFooter,
  LazyBlogSection,
  LazyAdminPanel,
  LazyBlogListing,
  LazyBlogPost,
  LazyPremiumBlogListing,
  LazyPremiumBlogPost
} from "./components/LazyWrapper";

// Import user profile pages
import UserProfile from "./pages/UserProfile";
import LikedBlogs from "./pages/LikedBlogs";
import SavedBlogs from "./pages/SavedBlogs";
import UserComments from "./pages/UserComments";

// Firebase Migration Helper completely removed

const Home = () => {
  // Track loading state for each section
  const [sectionsLoaded, setSectionsLoaded] = useState({
    hero: false,
    blog: false,
    about: false,
    contact: false
  });

  // Mark sections as loaded after component mount
  useEffect(() => {
    // Simulate progressive loading with natural delays
    const timers = [
      setTimeout(() => setSectionsLoaded(prev => ({ ...prev, hero: true })), 300),
      setTimeout(() => setSectionsLoaded(prev => ({ ...prev, about: true })), 600),
      setTimeout(() => setSectionsLoaded(prev => ({ ...prev, blog: true })), 900),
      setTimeout(() => setSectionsLoaded(prev => ({ ...prev, contact: true })), 1200)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  useEffect(() => {
    // Enhanced smooth scroll behavior with better easing
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.scrollPaddingTop = '80px'; // Account for navigation
    
    // Optimize page performance
    document.documentElement.style.setProperty('--scroll-behavior', 'smooth');
    
    // Custom cursor effect with performance optimizations
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.8), rgba(59, 130, 246, 0.4));
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
      transition: transform 0.1s ease;
      will-change: transform;
    `;
    document.body.appendChild(cursor);

    let rafId;
    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
      });
    };

    const handleMouseDown = () => {
      cursor.style.transform = 'scale(0.8)';
    };

    const handleMouseUp = () => {
      cursor.style.transform = 'scale(1)';
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafId) cancelAnimationFrame(rafId);
      if (cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
    };
  }, []);

  return (
    <PageTransition className="relative">
      <main>
        {/* Hero Section with skeleton loader */}
        {!sectionsLoaded.hero ? (
          <HeroSectionSkeleton />
        ) : (
          <HeroSection />
        )}

        {/* Blog Section with skeleton loader */}
        {!sectionsLoaded.blog ? (
          <BlogSectionSkeleton />
        ) : (
          <LazyBlogSection />
        )}

        {/* About Section with skeleton loader */}
        {!sectionsLoaded.about ? (
          <AboutSectionSkeleton />
        ) : (
          <AboutSection />
        )}

        {/* Contact Section with skeleton loader */}
        {!sectionsLoaded.contact ? (
          <ContactSectionSkeleton />
        ) : (
          <LazyContactSection />
        )}
      </main>
      <LazyFooter />
    </PageTransition>
  );
};

function App() {
  return (
    <HelmetProvider>
      <div className="App bg-black text-white overflow-x-hidden">
        <FirebaseAuthProvider>
          <BrowserRouter>
            {/* Firebase Migration Helper - Removed after migration complete */}
            
            <Routes>
            {/* Main portfolio website at root */}
            <Route path="/" element={
              <>
                <Navigation />
                <Home />
              </>
            } />
            <Route path="/blog" element={
              <>
                <Navigation />
                <LazyPremiumBlogListing />
              </>
            } />
            <Route path="/blog/:id" element={
              <>
                <Navigation />
                <LazyPremiumBlogPost />
              </>
            } />
            <Route path="/blog-old" element={
              <>
                <Navigation />
                <LazyBlogListing />
              </>
            } />
            <Route path="/blog-old/:id" element={
              <>
                <Navigation />
                <LazyBlogPost />
              </>
            } />
            
            {/* User profile routes */}
            <Route path="/user/profile" element={
              <>
                <Navigation />
                <UserProfile />
              </>
            } />
            <Route path="/user/liked-blogs" element={
              <>
                <Navigation />
                <LikedBlogs />
              </>
            } />
            <Route path="/user/saved-blogs" element={
              <>
                <Navigation />
                <SavedBlogs />
              </>
            } />
            <Route path="/user/comments" element={
              <>
                <Navigation />
                <UserComments />
              </>
            } />
            
            {/* Admin panel at /julian_portfolio */}
            <Route path="/julian_portfolio/*" element={<LazyAdminPanel />} />
            <Route path="/julian_portfolio" element={<LazyAdminPanel />} />
          </Routes>
          </BrowserRouter>
        </FirebaseAuthProvider>
      </div>
    </HelmetProvider>
  );
}

export default App;