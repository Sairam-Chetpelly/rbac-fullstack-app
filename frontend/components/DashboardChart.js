import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function DashboardChart({ type, title, period = '7d' }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [type, period]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/charts?type=${type}&period=${period}`);
      setChartData(response.data);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.datasets.flatMap(d => d.data));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          {chartData.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: dataset.color }}
              ></div>
              <span className="text-xs text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative" style={{ height: chartHeight }}>
        <svg width="100%" height={chartHeight} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <line
              key={index}
              x1="0"
              y1={chartHeight * ratio}
              x2="100%"
              y2={chartHeight * ratio}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Chart lines */}
          {chartData.datasets.map((dataset, datasetIndex) => {
            const points = dataset.data.map((value, index) => {
              const x = (index / (chartData.labels.length - 1)) * 100;
              const y = chartHeight - (value / maxValue) * chartHeight;
              return `${x}%,${y}`;
            }).join(' ');
            
            return (
              <g key={datasetIndex}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={dataset.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {dataset.data.map((value, index) => {
                  const x = (index / (chartData.labels.length - 1)) * 100;
                  const y = chartHeight - (value / maxValue) * chartHeight;
                  return (
                    <circle
                      key={index}
                      cx={`${x}%`}
                      cy={y}
                      r="3"
                      fill={dataset.color}
                      className="hover:r-4 transition-all"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {chartData.labels.map((label, index) => (
            <span key={index}>{new Date(label).toLocaleDateString()}</span>
          ))}
        </div>
      </div>
    </div>
  );
}