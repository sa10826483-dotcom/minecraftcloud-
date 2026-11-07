'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (userType: 'admin' | 'owner') => {
    if (userType === 'admin') {
      setLogin('admin@minecraftcloud.net');
      setPassword('AdminPass123!');
    } else {
      setLogin('owner@minecraftcloud.net');
      setPassword('Minecraft2026!');
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] flex items-center justify-center p-4 grid-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30 text-slate-950 font-black text-xl mb-2">
            MC
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Minecraft<span className="text-emerald-400">Cloud</span>
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access your cloud Minecraft servers & live console
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-white">Account Login</CardTitle>
            <CardDescription className="text-xs">
              Enter your email or username to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/40 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Email or Username</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="steve or steve@example.com"
                    required
                    className="pl-9 h-10 bg-slate-950 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-9 h-10 bg-slate-950 text-xs font-mono"
                  />
                </div>
              </div>

              <Button type="submit" variant="glow" disabled={loading} className="w-full gap-2">
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Quick Demo Autofill */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block text-center">
                Demo Quick Credentials
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('owner')}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 text-left transition-colors"
                >
                  <span className="font-semibold block text-emerald-400">Server Owner</span>
                  <span className="text-[10px] text-slate-500">owner@minecraftcloud.net</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 text-left transition-colors"
                >
                  <span className="font-semibold block text-amber-400">Global Admin</span>
                  <span className="text-[10px] text-slate-500">admin@minecraftcloud.net</span>
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-800/80 pt-4 text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-emerald-400 font-semibold hover:underline ml-1">
              Register now
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
