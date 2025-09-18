"use client";

import React, { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { useClientSide } from '@/hooks/use-client-side';
import { useErrorHandler } from '@/hooks/use-error-handler';

export default function LoginPage() {
  const [user, setUser] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isClient = useClientSide();
  const router = useRouter();
  const { handleAuthError, handleError, success } = useErrorHandler();

  const setEmail = (email: string) => setUser(prev => ({ ...prev, email }));
  const setPassword = (password: string) => setUser(prev => ({ ...prev, password }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: user.email,
        password: user.password,
        redirect: false,
      });

      if (result?.error) {
        // Handle authentication error with toast notification
        handleAuthError(new Error(result.error), 'Login');
        setError('Invalid email or password');
      } else {
        // Get the session to verify login was successful
        const session = await getSession();
        if (session) {
          success('Login successful', 'Welcome back!');
          router.push('/dashboard');
        } else {
          handleAuthError(new Error('Session not created'), 'Login');
        }
      }
    } catch (error) {
      // Handle any other errors (network, database, etc.)
      handleError(error, 'Login');
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };
  const authGuard = useAuthGuard();

  // Handle redirect when user is already authorized
  useEffect(() => {
    if (isClient && !authGuard.isLoading && authGuard.isAuthorized) {
      router.push('/dashboard');
    }
  }, [isClient, authGuard.isLoading, authGuard.isAuthorized, router]);

  // Prevent hydration mismatch by not rendering auth-dependent content on server
  if (!isClient) {
    return <LoadingSpinner />;
  }

  if (authGuard.isLoading) return <LoadingSpinner />;
  if (authGuard.isAuthorized) return <LoadingSpinner />; // Show loading while redirecting
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-sm ">
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>

            {error && (
              <div className="rounded-md mb-2 bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@granula.com"
                  required
                  value={user.email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password"
                  value={user.password}
                  onChange={(e) => setPassword(e.target.value)} type="password" required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full hover:scale-105 transition-transform">
              {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </Button>
            <Button variant="outline" className="w-full hover:scale-105 transition-transform">
              Login with Google
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}