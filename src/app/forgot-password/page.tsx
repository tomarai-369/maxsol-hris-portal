'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Building2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://mscorp.com.ph/MSC-logo-png-file.png" 
            alt="MS Corp" 
            className="w-16 h-16 object-contain mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-gray-900">MS Corp HRIS</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-mscorp-blue" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-600">
              Please contact the HR Department to reset your password.
            </p>
          </div>

          <div className="space-y-4">
            <a 
              href="mailto:hr@mscorp.com.ph?subject=Password Reset Request"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-mscorp-blue" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email HR</p>
                <p className="text-sm text-gray-500">hr@mscorp.com.ph</p>
              </div>
            </a>

            <a 
              href="tel:+6328123456"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Call HR</p>
                <p className="text-sm text-gray-500">(02) 8-123-4567</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Visit HR Office</p>
                <p className="text-sm text-gray-500">2nd Floor, Main Building</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-mscorp-blue hover:text-mscorp-dark font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          For security reasons, password resets must be processed by HR.
        </p>
      </div>
    </div>
  );
}
