import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
// WorkedWithSection removed as requested

// Import loading system components
import { ProfileLoadingScreen, ResourcePreloader, PageTransition } from "./components/LoadingSystem";

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

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Critical resources to preload for faster initial page load
  const criticalResources = [
    { type: 'font', src: 'https://fonts.googleapis.com/css2?family=Encode+Sans+Semi+Expanded:wght@300;400;600;700&display=swap' },
    // Add more critical resources as needed
  ];

  const { progress, isComplete } = ResourcePreloader({ 
    resources: criticalResources,
    onComplete: () => {
      setTimeout(() => setIsLoading(false), 500); // Quick test for border spacing fix
    }
  });

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
    <>
      <ProfileLoadingScreen 
        isLoading={isLoading}
      />
      
      <PageTransition className="relative">
        <main>
          <HeroSection />
          <LazyBlogSection />
          <AboutSection />
          <LazyContactSection />
        </main>
        <LazyFooter />
      </PageTransition>
    </>
  );
};

function App() {
  return (
    <div className="App bg-black text-white overflow-x-hidden">
      <AuthProvider>
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<LazyPremiumBlogListing />} />
            <Route path="/blog/:id" element={<LazyPremiumBlogPost />} />
            <Route path="/blog-old" element={<LazyBlogListing />} />
            <Route path="/blog-old/:id" element={<LazyBlogPost />} />
            <Route path="/julian_portfolio/*" element={<LazyAdminPanel />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;