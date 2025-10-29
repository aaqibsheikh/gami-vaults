'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatPercentage, formatUsd } from '@/lib/normalize';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoricalDataPoint {
  timestamp: string;
  apy: string;
  tvl: string;
  price: string;
}

interface PerformanceChartProps {
  data: HistoricalDataPoint[];
  period: '7d' | '30d';
  type: 'apy' | 'tvl';
  className?: string;
}

export default function PerformanceChart({ 
  data, 
  period, 
  type, 
  className = '' 
}: PerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const labels = sortedData.map(point => {
      const date = new Date(point.timestamp);
      return period === '7d' 
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const values = sortedData.map(point => {
      const value = type === 'apy' ? parseFloat(point.apy) : parseFloat(point.tvl);
      return type === 'apy' ? value * 100 : value; // Convert APY to percentage
    });

    const gradient = type === 'apy' 
      ? 'linear-gradient(180deg, rgba(0, 247, 146, 0.2) 0%, rgba(0, 247, 146, 0.05) 100%)'
      : 'linear-gradient(180deg, rgba(255, 156, 70, 0.2) 0%, rgba(255, 156, 70, 0.05) 100%)';

    return {
      labels,
      datasets: [
        {
          label: type === 'apy' ? 'APY (%)' : 'TVL (USD)',
          data: values,
          borderColor: type === 'apy' ? '#00F792' : '#FF9C46',
          backgroundColor: type === 'apy' ? '#00F792' : '#FF9C46',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: type === 'apy' ? '#00F792' : '#FF9C46',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
        }
      ]
    };
  }, [data, period, type]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: type === 'apy' ? '#00F792' : '#FF9C46',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            if (type === 'apy') {
              return `${value.toFixed(2)}% APY`;
            } else {
              return formatUsd(value.toString());
            }
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 12
          },
          maxTicksLimit: period === '7d' ? 7 : 6
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#ffffff',
          font: {
            size: 12
          },
          callback: function(value: any) {
            if (type === 'apy') {
              return `${value.toFixed(1)}%`;
            } else {
              return formatUsd(value.toString());
            }
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-white/50 font-modernist text-[16px] font-normal leading-[162%] tracking-[-0.32px]">
          No historical data available
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Line data={chartData} options={options} />
    </div>
  );
}
