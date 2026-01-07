'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, Star } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: string;
  publishDate: string;
}

const priorityConfig: Record<string, { icon: any; bg: string; border: string; dot: string }> = {
  High: {
    icon: AlertTriangle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  Medium: {
    icon: Star,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
  Normal: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600">Stay updated with company news and updates</p>
      </div>

      {/* Announcements List */}
      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const config = priorityConfig[announcement.priority] || priorityConfig.Normal;
            const Icon = config.icon;

            return (
              <div
                key={announcement.id}
                className={`${config.bg} ${config.border} border rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => setSelectedAnnouncement(announcement)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full ${config.dot} mt-1.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {announcement.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {announcement.category} • {announcement.publishDate}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          announcement.priority === 'High'
                            ? 'bg-red-100 text-red-800'
                            : announcement.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {announcement.priority}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-3 line-clamp-2">
                      {announcement.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-500">No announcements at the moment</p>
          <p className="text-sm text-gray-400 mt-1">Check back later for updates</p>
        </div>
      )}

      {/* Announcement Modal */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                      selectedAnnouncement.priority === 'High'
                        ? 'bg-red-100 text-red-800'
                        : selectedAnnouncement.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedAnnouncement.priority} Priority
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedAnnouncement.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedAnnouncement.category} • Published: {selectedAnnouncement.publishDate}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
