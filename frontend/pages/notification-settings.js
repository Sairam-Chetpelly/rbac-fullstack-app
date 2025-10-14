import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../lib/api';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailEnabled: true,
    whatsappEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/notification-settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (type) => {
    setSaving(true);
    try {
      const newSettings = {
        ...settings,
        [type]: !settings[type]
      };
      
      await api.put('/notification-settings', newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'admin') {
    return <Layout><div>Access denied</div></Layout>;
  }

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <p className="text-gray-500">Send welcome emails to new users</p>
                </div>
                <button
                  onClick={() => handleToggle('emailEnabled')}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">WhatsApp Notifications</h3>
                  <p className="text-gray-500">Send welcome messages via WhatsApp</p>
                </div>
                <button
                  onClick={() => handleToggle('whatsappEnabled')}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.whatsappEnabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.whatsappEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}