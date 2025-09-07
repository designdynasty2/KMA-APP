import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Smartphone, Download, Share2, Bell } from 'lucide-react';

interface MobileFriendlyAppProps {
  children: React.ReactNode;
}

export function MobileFriendlyApp({ children }: MobileFriendlyAppProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showMobileFeatures, setShowMobileFeatures] = useState(false);

  useEffect(() => {
    // Detect if user is on mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(mobile);
      
      // Show mobile features after a delay on mobile devices
      if (mobile) {
        setTimeout(() => setShowMobileFeatures(true), 2000);
      }
    };

    checkMobile();

    // Check if app can be installed (simplified check)
    const checkInstallability = () => {
      // Check if running in standalone mode (already installed)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      
      if (!isStandalone && isMobile) {
        setCanInstall(true);
      }
    };

    checkInstallability();
  }, [isMobile]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Montessori School Management',
          text: 'Check out this amazing school management app!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed or was cancelled');
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    }
  };

  const handleInstallHint = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      alert('To install this app on iOS:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install');
    } else {
      alert('To install this app:\n1. Look for the install prompt in your browser\n2. Or use your browser\'s menu to "Install app" or "Add to home screen"');
    }
  };

  return (
    <div className="mobile-friendly-app">
      {children}
      
      {/* Mobile-specific features */}
      {isMobile && showMobileFeatures && (
        <div className="fixed bottom-4 right-4 z-40 space-y-2">
          {/* Share button */}
          <Button
            size="sm"
            variant="secondary"
            onClick={handleShare}
            className="rounded-full shadow-lg h-12 w-12 p-0"
            title="Share app"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          
          {/* Install hint button */}
          {canInstall && (
            <Button
              size="sm"
              variant="default"
              onClick={handleInstallHint}
              className="rounded-full shadow-lg h-12 w-12 p-0"
              title="Install app"
            >
              <Download className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
      
      {/* Enhanced mobile styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .mobile-friendly-app {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
          
          @media (max-width: 768px) {
            .mobile-friendly-app button {
              min-height: 44px;
              min-width: 44px;
            }
            
            .mobile-friendly-app a, 
            .mobile-friendly-app button, 
            .mobile-friendly-app input, 
            .mobile-friendly-app select, 
            .mobile-friendly-app textarea {
              touch-action: manipulation;
            }
            
            .mobile-friendly-app * {
              -webkit-overflow-scrolling: touch;
            }
          }
          
          @media (display-mode: standalone) {
            .mobile-friendly-app {
              padding-top: env(safe-area-inset-top, 0);
              padding-bottom: env(safe-area-inset-bottom, 0);
            }
          }
        `
      }} />
    </div>
  );
}