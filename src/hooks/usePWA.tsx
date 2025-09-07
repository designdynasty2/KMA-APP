import { useState, useEffect } from 'react';

interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  canShare: boolean;
  hasNotificationPermission: boolean;
  hasGeolocation: boolean;
  hasCamera: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export function usePWA() {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    canShare: false,
    hasNotificationPermission: false,
    hasGeolocation: false,
    hasCamera: false,
    isMobile: false,
    isIOS: false,
    isAndroid: false,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check device type
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);

    // Check if app is installed (running in standalone mode)
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    // Check API support
    const canShare = 'share' in navigator;
    const hasGeolocation = 'geolocation' in navigator;
    const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

    // Check notification permission
    const hasNotificationPermission = 'Notification' in window && 
                                    Notification.permission === 'granted';

    setCapabilities(prev => ({
      ...prev,
      isInstalled,
      canShare,
      hasNotificationPermission,
      hasGeolocation,
      hasCamera,
      isMobile,
      isIOS,
      isAndroid,
    }));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCapabilities(prev => ({ ...prev, isInstallable: true }));
    };

    // Listen for online/offline status
    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }));

    // Listen for successful installation
    const handleAppInstalled = () => {
      setCapabilities(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Install the PWA
  const installPWA = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setCapabilities(prev => ({ ...prev, isInstallable: false }));
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    
    setCapabilities(prev => ({ ...prev, hasNotificationPermission: granted }));
    return granted;
  };

  // Show notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!capabilities.hasNotificationPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      ...options,
    };

    return new Notification(title, defaultOptions);
  };

  // Share content
  const shareContent = async (data: ShareData) => {
    if (!capabilities.canShare) {
      // Fallback to copying to clipboard
      if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(data.url || data.text || '');
        return true;
      }
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  };

  // Get user location
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!capabilities.hasGeolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    });
  };

  // Access camera
  const getCameraStream = async (constraints?: MediaStreamConstraints) => {
    if (!capabilities.hasCamera) {
      throw new Error('Camera not supported');
    }

    const defaultConstraints: MediaStreamConstraints = {
      video: {
        facingMode: 'environment', // Use back camera by default
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      ...constraints,
    };

    return await navigator.mediaDevices.getUserMedia(defaultConstraints);
  };

  // Register for push notifications
  const registerForPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY, // You'll need to set this
      });

      return subscription;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  };

  // Add to home screen shortcut
  const addToHomeScreen = () => {
    if (capabilities.isIOS) {
      // Show iOS instructions
      return {
        type: 'ios',
        instructions: [
          'Tap the Share button',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install',
        ],
      };
    }

    if (deferredPrompt) {
      return installPWA();
    }

    return null;
  };

  return {
    capabilities,
    installPWA,
    requestNotificationPermission,
    showNotification,
    shareContent,
    getCurrentPosition,
    getCameraStream,
    registerForPush,
    addToHomeScreen,
  };
}