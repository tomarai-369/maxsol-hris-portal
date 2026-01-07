'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, User, Building2, Briefcase } from 'lucide-react';

interface EmployeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  employeeId: string;
}

export default function ActivatePage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyActivated) {
          setError('This account is already activated. Redirecting to login...');
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        setError(data.error || 'Failed to find account');
        return;
      }

      setEmployee(data.employee);
      setStep('password');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/activate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to activate account');
        return;
      }

      setStep('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MS Corp!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been successfully activated. Redirecting to your dashboard...
            </p>
            <div className="flex items-center justify-center gap-2 text-mscorp-blue">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-mscorp-dark via-mscorp-blue to-mscorp-light items-center justify-center p-12">
        <div className="text-white text-center">
          <div className="mb-8">
            <img 
              src="https://mscorp.com.ph/MSC-logo-png-file.png" 
              alt="MS Corp" 
              className="w-32 h-32 object-contain mx-auto mb-6 bg-white rounded-2xl p-4"
            />
            <h1 className="text-4xl font-bold mb-2">Welcome!</h1>
            <p className="text-xl text-blue-200">Set up your employee account</p>
          </div>
          <div className="space-y-4 text-blue-100">
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">1</div>
              <span className={step === 'email' ? 'font-semibold' : ''}>Verify your email</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">2</div>
              <span className={step === 'password' ? 'font-semibold' : ''}>Create password</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">3</div>
              <span>Access your portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src="https://mscorp.com.ph/MSC-logo-png-file.png" 
              alt="MS Corp" 
              className="w-16 h-16 object-contain mx-auto mb-4"
            />
            <h1 className="text-xl font-bold text-gray-900">MS Corp HRIS</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {step === 'email' ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Activate Your Account</h2>
                <p className="text-gray-600 mb-8">
                  Enter your company email address to get started
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                        placeholder="your.email@company.com"
                        required
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Use the email address registered by HR
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-mscorp-blue text-white font-medium rounded-lg hover:bg-mscorp-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Password</h2>
                <p className="text-gray-600 mb-6">
                  Set a secure password for your account
                </p>

                {/* Employee Info Card */}
                {employee && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-mscorp-blue to-mscorp-light rounded-lg text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
                        <p className="text-sm text-blue-100">{employee.employeeId}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-200" />
                        <span>{employee.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-200" />
                        <span>{employee.position}</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-mscorp-blue text-white font-medium rounded-lg hover:bg-mscorp-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      'Activate Account'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setEmployee(null);
                      setPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                    className="w-full py-3 px-4 text-gray-600 font-medium hover:text-gray-900 transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Use different email
                  </button>
                </form>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/" className="text-mscorp-blue hover:text-mscorp-dark font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Having trouble? Contact HR at{' '}
            <a href="mailto:hr@mscorp.com.ph" className="text-mscorp-blue hover:underline">
              hr@mscorp.com.ph
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
