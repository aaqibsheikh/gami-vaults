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
  period: '7d' | '30d' | '365d' | 'all';
  type: 'apy' | 'tvl' | 'price';
  className?: string;
}

const DATE_FORMATTERS = {
  shortDay: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }),
  monthDay: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }),
  monthYear: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }),
};

function formatLabel(date: Date, period: '7d' | '30d' | '365d' | 'all'): string {
  if (period === '7d') {
    return DATE_FORMATTERS.shortDay.format(date);
  }

  if (period === '30d') {
    return DATE_FORMATTERS.monthDay.format(date);
  }

  // 365d / all-time: include year to avoid ambiguity
  return DATE_FORMATTERS.monthYear.format(date);
}

export default function PerformanceChart({
  data,
  period,
  type,
  className = '',
}: PerformanceChartProps) {
  // Create gradient function for area fill (Lagoon style)
  const getGradient = (ctx: CanvasRenderingContext2D, chartArea: any, type: 'apy' | 'tvl' | 'price') => {
    if (!chartArea) {
      return 'transparent';
    }
    
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    
    // Different gradient colors based on type
    if (type === 'apy') {
      // Green gradient for APY
      gradient.addColorStop(0, 'rgba(0, 247, 146, 0.3)');
      gradient.addColorStop(0.5, 'rgba(0, 247, 146, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 247, 146, 0.02)');
    } else if (type === 'tvl') {
      // Orange gradient for TVL
      gradient.addColorStop(0, 'rgba(255, 156, 70, 0.3)');
      gradient.addColorStop(0.5, 'rgba(255, 156, 70, 0.15)');
      gradient.addColorStop(1, 'rgba(255, 156, 70, 0.02)');
    } else {
      // Teal/cyan gradient for Price (Lagoon style)
      gradient.addColorStop(0, 'rgba(70, 200, 255, 0.4)');
      gradient.addColorStop(0.3, 'rgba(70, 200, 255, 0.2)');
      gradient.addColorStop(0.6, 'rgba(70, 200, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(70, 200, 255, 0.02)');
    }
    
    return gradient;
  };

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

    // Format labels based on period
    // For 7d: Show day labels (e.g., "Jan 1", "Jan 2")
    // For 30d/365d/all: Show month with 2-digit year (e.g., "Sep 25", "Oct 25", "Nov 25")
    const timestamps = sortedData.map((point) => point.timestamp);
    const labels = sortedData.map((point) => formatLabel(new Date(point.timestamp), period));

    const values = sortedData.map(point => {
      if (type === 'apy') {
        return parseFloat(point.apy) * 100; // Convert APY to percentage
      } else if (type === 'tvl') {
        return parseFloat(point.tvl);
      } else {
        // type === 'price'
        return parseFloat(point.price);
      }
    });

    // Determine line color - use white/light color for Lagoon style
    const lineColor = type === 'apy' ? '#00F792' : type === 'tvl' ? '#FF9C46' : '#FFFFFF';

    return {
      labels,
      timestamps,
      datasets: [
        {
          label: type === 'apy' ? 'APY (%)' : type === 'tvl' ? 'TVL (USD)' : 'Price per Share',
          data: values,
          borderColor: lineColor,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            if (!chart || !chart.chartArea) {
              // Return a fallback color if chart area is not available yet
              return type === 'apy' ? 'rgba(0, 247, 146, 0.1)' : 
                     type === 'tvl' ? 'rgba(255, 156, 70, 0.1)' : 
                     'rgba(70, 200, 255, 0.1)';
            }
            const {ctx, chartArea} = chart;
            return getGradient(ctx, chartArea, type);
          },
          borderWidth: 2,
          fill: true, // Enable area fill with gradient
          tension: 0, // Stepped line (0 = stepped, higher = curved)
          stepped: 'before' as const, // Stepped line style like Lagoon
          pointRadius: 0, // Hide all points
          pointHoverRadius: 6, // Show point on hover
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          pointBackgroundColor: 'transparent',
          pointBorderColor: 'transparent',
        }
      ]
    };
  }, [data, period, type]);

  // Determine which label indices to show for longer periods
  // Strategy: Show month boundaries when they occur, but also ensure even spacing
  const labelIndicesToShow = useMemo(() => {
    if (period === '7d' || !chartData.labels || chartData.labels.length === 0) {
      return null; // Show all labels for 7d
    }

    const labels = chartData.labels as string[];
    const timestamps = (chartData as { timestamps?: string[] }).timestamps ?? [];
    const indicesToShow = new Set<number>();

    indicesToShow.add(0);
    if (labels.length > 1) {
      indicesToShow.add(labels.length - 1);
    }

    let lastMonthKey: string | null = null;
    timestamps.forEach((timestamp, index) => {
      const date = new Date(timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (lastMonthKey === null) {
        lastMonthKey = monthKey;
        return;
      }

      if (monthKey !== lastMonthKey) {
        indicesToShow.add(index);
        lastMonthKey = monthKey;
      }
    });

    const targetLabels =
      period === '30d' ? 6 :
      period === '365d' ? 12 :
      10;

    if (indicesToShow.size < targetLabels && labels.length > targetLabels) {
      const step = Math.max(1, Math.floor(labels.length / (targetLabels - 1)));
      for (let i = step; i < labels.length - 1; i += step) {
        indicesToShow.add(i);
      }
      indicesToShow.add(labels.length - 1);
    }

    return indicesToShow;
  }, [chartData.labels, chartData, period]);


  const options = useMemo(() => ({
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
        borderColor: type === 'apy' ? '#00F792' : type === 'tvl' ? '#FF9C46' : '#469CFF',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            if (type === 'apy') {
              return `${value.toFixed(2)}% APY`;
            } else if (type === 'tvl') {
              return formatUsd(value.toString());
            } else {
              // type === 'price'
              return `${value.toFixed(6)} USDC`;
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
          // Set maxTicksLimit based on period
          maxTicksLimit: period === '7d' ? 7 : period === '30d' ? 6 : period === '365d' ? 12 : 15,
          // Callback to format and filter labels
          callback: function(value: any, index: number, ticks: any[]) {
            const labels = chartData.labels as string[];
            if (!labels || index >= labels.length || index < 0) {
              return '';
            }
            
            if (period === '7d') {
              // For 7d, show all labels (Chart.js will handle maxTicksLimit)
              return labels[index] || '';
            } else {
              // For longer periods, only show labels at month boundaries
              if (labelIndicesToShow && labelIndicesToShow.has(index)) {
                return labels[index] || '';
              }
              // Return empty string - Chart.js will skip empty labels
              return '';
            }
          },
          maxRotation: 0,
          minRotation: 0,
          // Auto-skip empty labels
          autoSkip: true,
          // Include bounds to show first and last
          includeBounds: true
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
            } else if (type === 'tvl') {
              return formatUsd(value.toString());
            } else {
              // type === 'price'
              return value.toFixed(4);
            }
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    elements: {
      line: {
        borderJoinStyle: 'round' as const,
        borderCapStyle: 'round' as const,
        borderWidth: 2,
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        hoverBorderWidth: 2
      }
    },
  }), [chartData.labels, labelIndicesToShow, period, type]);

  // Use chartData directly - label filtering is handled in the callback
  const displayChartData = chartData;

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
      <Line data={displayChartData} options={options} />
    </div>
  );
}
