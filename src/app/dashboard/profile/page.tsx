'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
  Loader2,
} from 'lucide-react';

interface UserProfile {
  id: number;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  department: string;
  position: string;
  employmentStatus: string;
  dateHired: string;
  birthDate?: string;
  contactNumber?: string;
  address?: string;
  emergencyContact?: string;
  emergencyNumber?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    contactNumber: '',
    address: '',
    emergencyContact: '',
    emergencyNumber: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setFormData({
          contactNumber: data.user.contactNumber || '',
          address: data.user.address || '',
          emergencyContact: data.user.emergencyContact || '',
          emergencyNumber: data.user.emergencyNumber || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      setSuccess('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-mscorp-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">View and update your personal information</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-mscorp-dark via-mscorp-blue to-mscorp-light rounded-2xl p-8 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-3xl font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">
              {user?.firstName} {user?.middleName} {user?.lastName}
            </h2>
            <p className="text-blue-200">{user?.position}</p>
            <p className="text-blue-300 text-sm">{user?.department}</p>
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">
                ID: {user?.employeeId}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">
                {user?.employmentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employment Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-mscorp-blue" />
            Employment Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{user?.department || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Position</p>
                <p className="font-medium text-gray-900">{user?.position || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Employment Status</p>
                <p className="font-medium text-gray-900">{user?.employmentStatus || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date Hired</p>
                <p className="font-medium text-gray-900">{user?.dateHired || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-mscorp-blue" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="font-medium text-gray-900">{user?.email || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Birth Date</p>
                <p className="font-medium text-gray-900">{user?.birthDate || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information - Editable */}
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-mscorp-blue" />
              Contact Information
            </h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center px-3 py-1.5 text-sm text-mscorp-blue hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      contactNumber: user?.contactNumber || '',
                      address: user?.address || '',
                      emergencyContact: user?.emergencyContact || '',
                      emergencyNumber: user?.emergencyNumber || '',
                    });
                  }}
                  className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-3 py-1.5 text-sm text-white bg-mscorp-blue hover:bg-mscorp-dark rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Contact Number</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                  placeholder="09XX XXX XXXX"
                />
              ) : (
                <p className="font-medium text-gray-900 py-2">
                  {user?.contactNumber || '-'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Address</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                  placeholder="Complete address"
                />
              ) : (
                <p className="font-medium text-gray-900 py-2">
                  {user?.address || '-'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Emergency Contact Person</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContact: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                  placeholder="Name and relationship"
                />
              ) : (
                <p className="font-medium text-gray-900 py-2">
                  {user?.emergencyContact || '-'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Emergency Contact Number</label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.emergencyNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                  placeholder="09XX XXX XXXX"
                />
              ) : (
                <p className="font-medium text-gray-900 py-2">
                  {user?.emergencyNumber || '-'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
