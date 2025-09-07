import { useEffect, ReactNode } from 'react';

interface MobileWrapperProps {
  children: ReactNode;
}

export function MobileWrapper({ children }: MobileWrapperProps) {
  useEffect(() => {
    // Prevent zoom on iOS
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Add touch event listeners
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

    // Set viewport meta tag for mobile optimization
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );

    // Add mobile-specific meta tags
    const addMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // iOS specific meta tags
    addMetaTag('apple-mobile-web-app-capable', 'yes');
    addMetaTag('apple-mobile-web-app-status-bar-style', 'default');
    addMetaTag('apple-mobile-web-app-title', 'Montessori School');

    // Android specific meta tags
    addMetaTag('mobile-web-app-capable', 'yes');
    addMetaTag('theme-color', '#030213');

    // Add Apple touch icons
    const addAppleIcon = (size: string) => {
      let link = document.querySelector(`link[rel="apple-touch-icon"][sizes="${size}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'apple-touch-icon');
        link.setAttribute('sizes', size);
        link.setAttribute('href', `/icons/icon-${size.replace('x', 'x')}.png`);
        document.head.appendChild(link);
      }
    };

    addAppleIcon('180x180');
    addAppleIcon('152x152');
    addAppleIcon('144x144');
    addAppleIcon('120x120');

    // Add manifest link
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      manifestLink.setAttribute('href', '/manifest.json');
      document.head.appendChild(manifestLink);
    }

    // Handle safe area insets for devices with notches
    const handleSafeArea = () => {
      const root = document.documentElement;
      
      // Set CSS custom properties for safe areas
      if (CSS.supports('padding: env(safe-area-inset-top)')) {
        root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
        root.style.setProperty('--safe-area-right', 'env(safe-area-inset-right)');
        root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
        root.style.setProperty('--safe-area-left', 'env(safe-area-inset-left)');
      } else {
        root.style.setProperty('--safe-area-top', '0px');
        root.style.setProperty('--safe-area-right', '0px');
        root.style.setProperty('--safe-area-bottom', '0px');
        root.style.setProperty('--safe-area-left', '0px');
      }
    };

    handleSafeArea();

    // Handle orientation changes
    const handleOrientationChange = () => {
      // Small delay to ensure the orientation change is complete
      setTimeout(() => {
        handleSafeArea();
        // Trigger a resize event to help components adapt
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchend', preventDoubleTapZoom);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return (
    <div className="mobile-app-wrapper min-h-screen bg-background">
      {/* Add safe area padding */}
      <style>{`
        .mobile-app-wrapper {
          padding-top: var(--safe-area-top, 0px);
          padding-right: var(--safe-area-right, 0px);
          padding-bottom: var(--safe-area-bottom, 0px);
          padding-left: var(--safe-area-left, 0px);
        }
        
        /* Improve touch targets for mobile */
        button, a, input, select, textarea {
          min-height: 44px;
          touch-action: manipulation;
        }
        
        /* Smooth scrolling */
        * {
          -webkit-overflow-scrolling: touch;
        }
        
        /* Hide scrollbars on mobile for cleaner look */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            display: none;
          }
          
          * {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        }
        
        /* Enhance mobile touch interactions */
        .mobile-touch-target {
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Add haptic feedback styles */
        @media (hover: none) and (pointer: coarse) {
          button:active, .mobile-touch-target:active {
            transform: scale(0.98);
            transition: transform 0.1s ease;
          }
        }
      `}</style>
      {children}
    </div>
  );
}