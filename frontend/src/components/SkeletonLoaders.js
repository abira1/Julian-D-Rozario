import React from 'react';

// Modern skeleton animation with shimmer effect
const shimmerAnimation = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

// Inject shimmer animation styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerAnimation;
  document.head.appendChild(styleSheet);
}

// Hero Section Skeleton
export const HeroSectionSkeleton = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-black via-slate-950 to-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 backdrop-blur-sm"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
          
          {/* Left Column - Text Skeleton */}
          <div className="space-y-8">
            {/* Greeting skeleton */}
            <div className="flex items-center justify-center lg:justify-start">
              <div className="w-32 h-10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear'
                }}
              ></div>
            </div>

            {/* Name skeleton */}
            <div className="text-center lg:text-left space-y-3">
              <div className="h-16 lg:h-20 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse w-3/4 mx-auto lg:mx-0"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear'
                }}
              ></div>
            </div>

            {/* Title skeleton */}
            <div className="text-center lg:text-left space-y-2">
              <div className="h-8 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse w-5/6 mx-auto lg:mx-0"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  animationDelay: '0.1s'
                }}
              ></div>
              <div className="h-8 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse w-4/6 mx-auto lg:mx-0"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  animationDelay: '0.2s'
                }}
              ></div>
            </div>

            {/* Tagline skeleton */}
            <div className="text-center lg:text-left space-y-2">
              <div className="h-6 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse w-full"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  animationDelay: '0.3s'
                }}
              ></div>
            </div>

            {/* CTA Button skeleton */}
            <div className="flex justify-center lg:justify-start">
              <div className="h-14 w-56 bg-gradient-to-r from-purple-500/20 via-purple-400/20 to-blue-500/20 rounded-xl animate-pulse"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  animationDelay: '0.4s'
                }}
              ></div>
            </div>
          </div>

          {/* Right Column - Image Skeleton */}
          <div className="flex justify-center lg:justify-end relative">
            <div className="relative">
              {/* Background glow */}
              <div className="absolute -inset-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-50 blur-3xl rounded-full"></div>
              
              {/* Main image skeleton */}
              <div className="relative z-20 p-8">
                <div 
                  className="w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-r from-white/5 via-white/10 to-white/5 shadow-2xl border-4 border-white/20 animate-pulse"
                  style={{
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                    backgroundSize: '1000px 100%',
                    animation: 'shimmer 2s infinite linear',
                    animationDelay: '0.5s'
                  }}
                ></div>
              </div>

              {/* Floating tag skeletons */}
              {[0, 1, 2, 3, 4].map((index) => (
                <div 
                  key={index}
                  className="hidden lg:block absolute bg-white/5 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/10 z-30"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(${['-300px', '200px', '-350px', '-300px', '150px'][index]}, ${['-100px', '-50px', '50px', '150px', '100px'][index]})`,
                    width: '150px',
                    height: '36px',
                    animation: 'shimmer 2s infinite linear',
                    animationDelay: `${0.6 + index * 0.1}s`
                  }}
                >
                  <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 h-full rounded-full"
                    style={{
                      backgroundSize: '1000px 100%'
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services strip skeleton */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <div className="flex space-x-12 py-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i}
                className="flex-shrink-0 h-12 w-48 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-full animate-pulse"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  animationDelay: `${1 + i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Blog Section Skeleton
export const BlogSectionSkeleton = () => {
  return (
    <section className="relative py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center mb-16 space-y-4">
          <div className="h-12 w-64 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse mx-auto"
            style={{
              backgroundSize: '1000px 100%',
              animation: 'shimmer 2s infinite linear'
            }}
          ></div>
          <div className="h-6 w-96 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse mx-auto"
            style={{
              backgroundSize: '1000px 100%',
              animation: 'shimmer 2s infinite linear',
              animationDelay: '0.1s'
            }}
          ></div>
        </div>

        {/* Blog cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-6 space-y-4 border border-white/10">
              {/* Image skeleton */}
              <div className="h-48 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
              
              {/* Category badge skeleton */}
              <div className="h-6 w-24 bg-gradient-to-r from-purple-500/20 via-purple-400/20 to-blue-500/20 rounded-full animate-pulse"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  animationDelay: `${i * 0.1 + 0.1}s`
                }}
              ></div>
              
              {/* Title skeleton */}
              <div className="space-y-2">
                <div className="h-6 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded animate-pulse"
                  style={{
                    backgroundSize: '1000px 100%',
                    animation: 'shimmer 2s infinite linear',
                    animationDelay: `${i * 0.1 + 0.2}s`
                  }}
                ></div>
                <div className="h-6 w-4/5 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded animate-pulse"
                  style={{
                    backgroundSize: '1000px 100%',
                    animation: 'shimmer 2s infinite linear',
                    animationDelay: `${i * 0.1 + 0.3}s`
                  }}
                ></div>
              </div>
              
              {/* Excerpt skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded animate-pulse"
                  style={{
                    backgroundSize: '1000px 100%',
                    animation: 'shimmer 2s infinite linear',
                    animationDelay: `${i * 0.1 + 0.4}s`
                  }}
                ></div>
                <div className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded animate-pulse"
                  style={{
                    backgroundSize: '1000px 100%',
                    animation: 'shimmer 2s infinite linear',
                    animationDelay: `${i * 0.1 + 0.5}s`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// About Section Skeleton
export const AboutSectionSkeleton = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-black to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image skeleton */}
          <div className="flex justify-center">
            <div className="w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-2xl animate-pulse"
              style={{
                backgroundSize: '1000px 100%',
                animation: 'shimmer 2s infinite linear'
              }}
            ></div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="h-10 w-48 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse"
              style={{
                backgroundSize: '1000px 100%',
                animation: 'shimmer 2s infinite linear'
              }}
            ></div>
            
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded animate-pulse"
                  style={{
                    width: i === 5 ? '80%' : '100%',
                    backgroundSize: '1000px 100%',
                    animation: 'shimmer 2s infinite linear',
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>

            <div className="flex gap-4">
              <div className="h-12 w-32 bg-gradient-to-r from-purple-500/20 via-purple-400/20 to-blue-500/20 rounded-lg animate-pulse"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear'
                }}
              ></div>
              <div className="h-12 w-32 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  animationDelay: '0.1s'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Contact Section Skeleton
export const ContactSectionSkeleton = () => {
  return (
    <section className="relative py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <div className="h-12 w-64 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse mx-auto"
            style={{
              backgroundSize: '1000px 100%',
              animation: 'shimmer 2s infinite linear'
            }}
          ></div>
          <div className="h-6 w-96 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse mx-auto"
            style={{
              backgroundSize: '1000px 100%',
              animation: 'shimmer 2s infinite linear',
              animationDelay: '0.1s'
            }}
          ></div>
        </div>

        <div className="max-w-lg mx-auto bg-white/5 rounded-xl p-8 space-y-6 border border-white/10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-12 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg animate-pulse"
                style={{
                  backgroundSize: '1000px 100%',
                  animation: 'shimmer 2s infinite linear',
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            </div>
          ))}
          
          <div className="h-12 w-full bg-gradient-to-r from-purple-500/20 via-purple-400/20 to-blue-500/20 rounded-lg animate-pulse mt-6"
            style={{
              backgroundSize: '1000px 100%',
              animation: 'shimmer 2s infinite linear',
              animationDelay: '0.4s'
            }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default {
  HeroSectionSkeleton,
  BlogSectionSkeleton,
  AboutSectionSkeleton,
  ContactSectionSkeleton
};
