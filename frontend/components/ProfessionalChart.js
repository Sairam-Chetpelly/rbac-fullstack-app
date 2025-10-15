import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function ProfessionalChart({ type, title, period = '30d', chartType = 'line' }) {
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
      <div className="bg-white rounded-2xl shadow-lg border p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="h-80 flex flex-col items-center justify-center text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-lg font-medium">No data available</div>
          <div className="text-sm">Data will appear here once you have activity</div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.datasets.flatMap(d => d.data)) || 1;
  const chartHeight = 300;
  const chartWidth = 100;

  const renderLineChart = () => (
    <svg width="100%" height={chartHeight} className="overflow-visible">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
        <g key={index}>
          <line
            x1="0"
            y1={chartHeight * ratio}
            x2="100%"
            y2={chartHeight * ratio}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
          <text
            x="0"
            y={chartHeight * ratio - 5}
            className="text-xs fill-gray-400"
          >
            {Math.round(maxValue * (1 - ratio))}
          </text>
        </g>
      ))}
      
      {/* Chart lines */}
      {chartData.datasets.map((dataset, datasetIndex) => {
        const points = dataset.data.map((value, index) => {
          const x = (index / Math.max(chartData.labels.length - 1, 1)) * 100;
          const y = chartHeight - (value / maxValue) * chartHeight;
          return `${x},${y}`;
        }).join(' ');
        
        return (
          <g key={datasetIndex}>
            {/* Area fill */}
            <polygon
              points={`0,${chartHeight} ${points} 100,${chartHeight}`}
              fill={`url(#gradient-${datasetIndex})`}
              opacity="0.1"
            />
            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke={dataset.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Data points */}
            {dataset.data.map((value, index) => {
              const x = (index / Math.max(chartData.labels.length - 1, 1)) * 100;
              const y = chartHeight - (value / maxValue) * chartHeight;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={dataset.color}
                  className="hover:r-6 transition-all cursor-pointer"
                />
              );
            })}
          </g>
        );
      })}
      
      {/* Gradients */}
      <defs>
        {chartData.datasets.map((dataset, index) => (
          <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={dataset.color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={dataset.color} stopOpacity="0"/>
          </linearGradient>
        ))}
      </defs>
    </svg>
  );

  const renderBarChart = () => {
    const barWidth = 80 / chartData.labels.length;
    return (
      <svg width="100%" height={chartHeight} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <line
            key={index}
            x1="0"
            y1={chartHeight * ratio}
            x2="100%"
            y2={chartHeight * ratio}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
        
        {/* Bars */}
        {chartData.labels.map((label, labelIndex) => {
          const x = (labelIndex / chartData.labels.length) * 100;
          return chartData.datasets.map((dataset, datasetIndex) => {
            const value = dataset.data[labelIndex] || 0;
            const barHeight = (value / maxValue) * chartHeight;
            const barX = x + (datasetIndex * (barWidth / chartData.datasets.length));
            const barWidthPercent = barWidth / chartData.datasets.length;
            
            return (
              <rect
                key={`${labelIndex}-${datasetIndex}`}
                x={barX}
                y={chartHeight - barHeight}
                width={barWidthPercent}
                height={barHeight}
                fill={dataset.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                rx="2"
              />
            );
          });
        })}
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-8 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex gap-4">
          {chartData.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full shadow-sm" 
                style={{ backgroundColor: dataset.color }}
              ></div>
              <span className="text-sm font-medium text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative mb-4">
        {chartType === 'line' ? renderLineChart() : renderBarChart()}
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-4">
        {chartData.labels.map((label, index) => (
          <span key={index} className="transform -rotate-45 origin-left">
            {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  );
}