import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function RealTimeWidget() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/analytics/realtime');
      setMetrics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch real-time metrics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-4"></div>
          <div className="h-8 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">🔴 Live Metrics</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm opacity-90">Live</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold mb-1">
            {metrics.today?.applications || 0}
          </div>
          <div className="text-sm opacity-90">Today's Applications</div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold mb-1">
            {metrics.pending?.applications || 0}
          </div>
          <div className="text-sm opacity-90">Pending Review</div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold mb-1">
            {metrics.week?.applications || 0}
          </div>
          <div className="text-sm opacity-90">This Week</div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="text-2xl font-bold mb-1">
            {metrics.pending?.payments || 0}
          </div>
          <div className="text-sm opacity-90">Pending Payments</div>
        </div>
      </div>
      
      <div className="mt-4 text-xs opacity-75 text-center">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}