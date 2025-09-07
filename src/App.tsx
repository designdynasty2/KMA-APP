import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase/client';
import { projectId } from './utils/supabase/info';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { MobileWrapper } from './components/MobileWrapper';
import { MobileFriendlyApp } from './components/MobileFriendlyApp';
import { Toaster } from './components/ui/sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'principal' | 'lead' | 'lead_teacher' | 'sub_teacher' | 'parent';
  access_token: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    // Only register service worker after initial load
    const timer = setTimeout(() => {
      registerServiceWorker();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Register service worker for PWA functionality
  async function registerServiceWorker() {
    // Skip service worker registration in development or preview environments
    if (!('serviceWorker' in navigator) || 
        window.location.hostname.includes('figma') ||
        window.location.hostname.includes('localhost') ||
        window.location.hostname.includes('127.0.0.1') ||
        window.location.protocol === 'file:') {
      console.log('Service Worker registration skipped in this environment');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker version available');
            }
          });
        }
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          window.location.reload();
        }
      });

    } catch (error) {
      console.log('Service Worker not available, continuing with basic mobile features:', error.message);
    }
  }

  async function checkUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.access_token) {
        // Fetch user role from our backend
        const userRole = await fetchUserRole(session.access_token);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || '',
          role: userRole,
          access_token: session.access_token
        });
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserRole(accessToken: string): Promise<User['role']> {
    // Skip API call for demo tokens
    if (accessToken.startsWith('demo-token-')) {
      return 'parent'; // This will be overridden by the demo login logic
    }
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/user/role`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data.role || 'parent'; // Default to parent role
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'parent';
    }
  }

  async function handleLogin(userData: User) {
    setUser(userData);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (loading) {
    return (
      <MobileFriendlyApp>
        <MobileWrapper>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </MobileWrapper>
      </MobileFriendlyApp>
    );
  }

  if (!user) {
    return (
      <MobileFriendlyApp>
        <MobileWrapper>
          <LoginPage onLogin={handleLogin} />
          <Toaster />
        </MobileWrapper>
      </MobileFriendlyApp>
    );
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    if (['admin', 'principal', 'lead'].includes(user.role)) {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    } else if (['lead_teacher', 'sub_teacher'].includes(user.role)) {
      return <TeacherDashboard user={user} onLogout={handleLogout} />;
    } else {
      return <ParentDashboard user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <MobileFriendlyApp>
      <MobileWrapper>
        {renderDashboard()}
        <Toaster />
      </MobileWrapper>
    </MobileFriendlyApp>
  );
}