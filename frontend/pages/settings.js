import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../lib/roles';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('system');
  const [settings, setSettings] = useState({
    appName: 'RBAC Admin Panel',
    sessionTimeout: 30,
    twoFactorAuth: false,
    passwordComplexity: true,
    loginAttempts: true,
    smtpServer: '',
    smtpPort: 587,
    fromEmail: ''
  });

  useEffect(() => {
    if (!user || !canAccess(user.role, 'settings')) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  if (!user || !canAccess(user.role, 'settings')) {
    return <div>Access denied</div>;
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = (section) => {
    alert(`${section} settings saved successfully!`);
  };

  const tabs = [
    { id: 'system', name: 'System', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'backup', name: 'Backup', icon: '💾' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🔧 Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <Card className="sticky top-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        <div className="lg:w-3/4 space-y-6">
          {activeTab === 'system' && (
            <Card title="System Configuration" icon="⚙️">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏷️ Application Name
                  </label>
                  <input
                    type="text"
                    value={settings.appName}
                    onChange={(e) => handleSettingChange('appName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⏰ Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-1">Users will be logged out after this period of inactivity</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500 text-xl">💡</div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">System Information</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>Version: 1.0.0</p>
                        <p>Last Updated: {new Date().toLocaleDateString()}</p>
                        <p>Environment: Production</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave('System')} icon="💾">
                  Save System Settings
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card title="Security Settings" icon="🔒">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔐</span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔑</span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Password Complexity</h4>
                        <p className="text-sm text-gray-500">Enforce strong password requirements</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.passwordComplexity}
                        onChange={(e) => handleSettingChange('passwordComplexity', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚫</span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Login Attempt Limits</h4>
                        <p className="text-sm text-gray-500">Lock account after 5 failed attempts</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.loginAttempts}
                        onChange={(e) => handleSettingChange('loginAttempts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <Button onClick={() => handleSave('Security')} icon="🔒">
                  Update Security Settings
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'email' && (
            <Card title="Email Configuration" icon="📧">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🌐 SMTP Server
                  </label>
                  <input
                    type="text"
                    value={settings.smtpServer}
                    onChange={(e) => handleSettingChange('smtpServer', e.target.value)}
                    placeholder="smtp.example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔌 Port
                    </label>
                    <input
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                      placeholder="587"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📧 From Email
                    </label>
                    <input
                      type="email"
                      value={settings.fromEmail}
                      onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
                      placeholder="noreply@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => handleSave('Email')} icon="💾">
                    Save Email Settings
                  </Button>
                  <Button variant="outline" icon="📧">
                    Test Connection
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'backup' && (
            <Card title="Backup & Maintenance" icon="💾">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">💾</span>
                      <h4 className="font-semibold text-gray-900">Database Backup</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Last backup: 2 hours ago</p>
                    <Button size="sm" icon="💾">Create Backup</Button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🧹</span>
                      <h4 className="font-semibold text-gray-900">System Cleanup</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Clean temporary files and logs</p>
                    <Button size="sm" variant="outline" icon="🧹">Run Cleanup</Button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-500 text-xl">⚠️</div>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-900 mb-1">Maintenance Mode</h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        Enable maintenance mode to perform system updates safely
                      </p>
                      <Button size="sm" variant="secondary" icon="🔧">
                        Enable Maintenance Mode
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}