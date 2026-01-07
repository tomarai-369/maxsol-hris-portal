'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2, Clock, Calendar, FileText, Wallet, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Clock, label: 'Time & Attendance', desc: 'Clock in/out with GPS' },
    { icon: Calendar, label: 'Leave Management', desc: 'Apply and track leaves' },
    { icon: Wallet, label: 'Payslips', desc: 'View salary details' },
    { icon: FileText, label: 'Documents', desc: 'Request certificates' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-mscorp-dark via-mscorp-blue to-mscorp-light items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-32 right-20 w-60 h-60 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
        </div>

        <div className="text-white text-center relative z-10 max-w-md">
          <div className="mb-8">
            <img 
              src="https://mscorp.com.ph/MSC-logo-png-file.png" 
              alt="MS Corp" 
              className="w-36 h-36 object-contain mx-auto mb-6 bg-white rounded-2xl p-4 shadow-2xl"
            />
            <h1 className="text-4xl font-bold mb-3">MS Corp HRIS</h1>
            <p className="text-xl text-blue-200">Employee Self-Service Portal</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left hover:bg-white/20 transition-colors"
              >
                <feature.icon className="w-8 h-8 mb-2 text-blue-200" />
                <p className="font-semibold text-sm">{feature.label}</p>
                <p className="text-xs text-blue-200">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src="https://mscorp.com.ph/MSC-logo-png-file.png" 
              alt="MS Corp" 
              className="w-20 h-20 object-contain mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">MS Corp HRIS</h1>
            <p className="text-gray-500">Employee Portal</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
              <p className="text-gray-600 mt-1">Sign in to access your portal</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent transition-shadow"
                    placeholder="your.email@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-mscorp-blue hover:text-mscorp-dark"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent transition-shadow"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-mscorp-blue text-white font-medium rounded-lg hover:bg-mscorp-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                First time here?{' '}
                <Link 
                  href="/activate" 
                  className="text-mscorp-blue hover:text-mscorp-dark font-semibold"
                >
                  Activate your account
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact{' '}
              <a href="mailto:hr@mscorp.com.ph" className="text-mscorp-blue hover:underline">
                HR Department
              </a>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              © 2024 MS Corp. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
