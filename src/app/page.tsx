'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Email:', email, 'Password:', password);
    // Add your signup logic here
  };

  const handleSocialLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Add your social login logic here
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container flex h-screen flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleSocialLogin}
                className="w-full"
              >
                Gmail
              </Button>
              <Button
                variant="outline"
                onClick={handleSocialLogin}
                className="w-full"
              >
                Outlook
              </Button>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 