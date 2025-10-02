import React, { useState, useEffect } from 'react';

const BlurImage = ({ 
  src, 
  alt, 
  className = '',
  placeholderSrc = null,
  blurDataURL = null,
  ...props 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholderSrc || src);
  
  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      // Fallback to a default placeholder on error
      setImageLoaded(true);
    };
    
    img.src = src;
  }, [src]);

  // Generate a simple blur data URL if none provided
  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    
    // Create a simple 1x1 pixel blur placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImJsdXIiPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSI1IiAvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMGYwZjAiIGZpbHRlcj0idXJsKCNibHVyKSIgLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiNjY2MiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5JbWFnZTwvdGV4dD4KPC9zdmc+';
  };

  return (
    <div className={`relative overflow-hidden ${className}`} {...props}>
      {/* Background blur placeholder */}
      {!imageLoaded && (
        <div 
          className="absolute inset-0 bg-gray-800 animate-pulse"
          style={{
            backgroundImage: `url("${getBlurDataURL()}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
          }}
        />
      )}
      
      {/* Main image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          imageLoaded 
            ? 'opacity-100 filter-none' 
            : 'opacity-0 filter blur-sm'
        }`}
        style={{
          filter: imageLoaded ? 'none' : 'blur(8px)',
        }}
      />
      
      {/* Loading indicator overlay */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin opacity-60" />
        </div>
      )}
    </div>
  );
};

export default BlurImage;