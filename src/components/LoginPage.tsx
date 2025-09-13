import { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { User } from '../App';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for demo credentials first
      const demoCredentials = [
        { email: 'admin@montessori.edu', password: 'admin123', role: 'admin' as const, name: 'School Administrator', id: 'demo-admin' },
        { email: 'teacher@montessori.edu', password: 'teacher123', role: 'lead_teacher' as const, name: 'Ms. Johnson', id: 'demo-teacher' },
        { email: 'parent@montessori.edu', password: 'parent123', role: 'parent' as const, name: 'John Parent', id: 'demo-parent' }
      ];

      const demoUser = demoCredentials.find(cred => cred.email === email && cred.password === password);
      
      if (demoUser) {
        // Demo mode login
        const user: User = {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          access_token: 'demo-token-' + demoUser.id
        };

        onLogin(user);
        toast.success(`Demo login successful! Welcome ${demoUser.name}`);
        return;
      }

      // Regular Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Login failed: ' + error.message);
        return;
      }

      if (data.session?.access_token) {
        // Fetch user role from backend
        const userRole = await fetchUserRole(data.session.access_token);
        
        const user: User = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.user_metadata?.name || data.session.user.email || '',
          role: userRole,
          access_token: data.session.access_token
        };

        onLogin(user);
        toast.success('Login successful!');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        toast.error('Google login failed: ' + error.message);
        console.log('Please complete Google OAuth setup at https://supabase.com/docs/guides/auth/social-login/auth-google');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    }
  }

  async function handleMicrosoftLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
      });

      if (error) {
        toast.error('Microsoft login failed: ' + error.message);
        console.log('Please complete Microsoft OAuth setup at https://supabase.com/docs/guides/auth/social-login/auth-azure');
      }
    } catch (error) {
      console.error('Microsoft login error:', error);
      toast.error('Microsoft login failed');
    }
  }

  async function fetchUserRole(accessToken: string): Promise<User['role']> {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5c30ae9/user/role`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data.role || 'parent';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'parent';
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Kidz Montessori Academy</CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleGoogleLogin} className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" onClick={handleMicrosoftLogin} className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#f25022" d="M1 1h10v10H1z"/>
                <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                <path fill="#7fba00" d="M1 13h10v10H1z"/>
                <path fill="#ffb900" d="M13 13h10v10H13z"/>
              </svg>
              Microsoft
            </Button>
          </div>

          <div className="space-y-3">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">Demo Mode - Quick Login:</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setEmail('admin@montessori.edu'); setPassword('admin123'); }}
                className="text-left justify-start"
              >
                👨‍💼 Admin Demo (Full Access)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setEmail('teacher@montessori.edu'); setPassword('teacher123'); }}
                className="text-left justify-start"
              >
                👩‍🏫 Teacher Demo (Materials & Gallery)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setEmail('parent@montessori.edu'); setPassword('parent123'); }}
                className="text-left justify-start"
              >
                👨‍👩‍👧‍👦 Parent Demo (View Only)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
