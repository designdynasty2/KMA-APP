<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  
  <!-- Primary Meta Tags -->
  <title>Montessori School Management</title>
  <meta name="title" content="Montessori School Management" />
  <meta name="description" content="Comprehensive Montessori school management application for administrators, teachers, and parents" />
  <meta name="keywords" content="montessori, school, management, education, teachers, parents, students" />
  <meta name="author" content="Montessori School Management" />
  
  <!-- Theme and Mobile Optimization -->
  <meta name="theme-color" content="#030213" />
  <meta name="background-color" content="#ffffff" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-status-bar-style" content="default" />
  
  <!-- iOS Specific -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Montessori School" />
  <meta name="apple-touch-fullscreen" content="yes" />
  
  <!-- Apple Touch Icons -->
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
  <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
  <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
  <link rel="shortcut icon" href="/favicon.ico" />
  
  <!-- Manifest -->
  <link rel="manifest" href="/manifest.json" />
  
  <!-- Microsoft Tiles -->
  <meta name="msapplication-TileColor" content="#030213" />
  <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
  <meta name="msapplication-config" content="/browserconfig.xml" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://montessori-school-management.app/" />
  <meta property="og:title" content="Montessori School Management" />
  <meta property="og:description" content="Comprehensive Montessori school management application for administrators, teachers, and parents" />
  <meta property="og:image" content="https://images.unsplash.com/photo-1663153206192-6d0e4c9570dd?w=1200&h=630&fit=crop" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://montessori-school-management.app/" />
  <meta property="twitter:title" content="Montessori School Management" />
  <meta property="twitter:description" content="Comprehensive Montessori school management application for administrators, teachers, and parents" />
  <meta property="twitter:image" content="https://images.unsplash.com/photo-1663153206192-6d0e4c9570dd?w=1200&h=630&fit=crop" />
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
  
  <!-- Prevent FOUC -->
  <style>
    html {
      visibility: hidden;
      opacity: 0;
    }
    
    html.loaded {
      visibility: visible;
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    
    /* Loading screen */
    #initial-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    
    .loader-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #030213;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Hide loader once React app loads */
    .app-loaded #initial-loader {
      display: none;
    }
  </style>
</head>
<body>
  <noscript>
    <div style="padding: 2rem; text-align: center; font-family: system-ui, sans-serif;">
      <h1>JavaScript Required</h1>
      <p>This application requires JavaScript to function properly. Please enable JavaScript in your browser settings.</p>
    </div>
  </noscript>
  
  <!-- Initial loading screen -->
  <div id="initial-loader">
    <div class="loader-spinner"></div>
  </div>
  
  <!-- React app root -->
  <div id="root"></div>
  
  <!-- Service Worker Registration -->
  <script>
    // Remove initial loader once DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      document.documentElement.classList.add('loaded');
      
      // Remove initial loader after React app loads
      setTimeout(function() {
        document.body.classList.add('app-loaded');
      }, 500);
    });
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('ServiceWorker registration successful');
          })
          .catch(function(err) {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }
    
    // Handle app installation
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      deferredPrompt = e;
      
      // Store the event for later use
      window.deferredPrompt = deferredPrompt;
    });
    
    // Handle successful installation
    window.addEventListener('appinstalled', function() {
      console.log('PWA was installed');
      deferredPrompt = null;
    });
    
    // Handle orientation changes
    function handleOrientationChange() {
      // Update viewport height for mobile browsers
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', function() {
      setTimeout(handleOrientationChange, 100);
    });
    
    // Initial viewport height setup
    handleOrientationChange();
  </script>
</body>
</html>