import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import BlogSection from "./components/BlogSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import BlogListing from "./components/BlogListing";
import BlogPost from "./components/BlogPost";
import AdminPanel from "./components/AdminPanel";

const Home = () => {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Custom cursor effect
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
    `;
    document.body.appendChild(cursor);

    const handleMouseMove = (e) => {
      cursor.style.left = e.clientX - 10 + 'px';
      cursor.style.top = e.clientY - 10 + 'px';
    };

    const handleMouseDown = () => {
      cursor.style.transform = 'scale(0.8)';
    };

    const handleMouseUp = () => {
      cursor.style.transform = 'scale(1)';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      if (cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
    };
  }, []);

  return (
    <div className="relative">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <div className="App bg-black text-white overflow-x-hidden">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogListing />} />
          <Route path="/blog/:id" element={<BlogPost />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
