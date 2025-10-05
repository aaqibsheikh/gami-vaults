/**
 * KPIs component for displaying vault key performance indicators
 */

import { VaultDTO } from '@/lib/dto';
import { formatUsd, formatPercentage } from '@/lib/normalize';

interface KPIsProps {
  vault: VaultDTO;
}

type KPIChangeType = 'positive' | 'negative' | 'neutral';

interface KPI {
  label: string;
  value: string;
  change: string | null;
  changeType: KPIChangeType;
}

export function KPIs({ vault }: KPIsProps) {
  const kpis: KPI[] = [
    {
      label: 'Total Value Locked',
      value: formatUsd(vault.tvlUsd),
      change: null,
      changeType: 'neutral'
    },
    {
      label: 'Net APY',
      value: formatPercentage(vault.apyNet),
      change: null,
      changeType: 'neutral'
    },
    {
      label: 'Management Fee',
      value: `${(parseFloat(vault.fees.mgmtBps) / 100).toFixed(2)}%`,
      change: null,
      changeType: 'neutral'
    },
    {
      label: 'Performance Fee',
      value: `${(parseFloat(vault.fees.perfBps) / 100).toFixed(2)}%`,
      change: null,
      changeType: 'neutral'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold text-white">
                {kpi.value}
              </p>
            </div>
            {kpi.change && (
              <div className={`flex items-center text-sm font-medium ${
                kpi.changeType === 'positive' ? 'text-green-400' : 
                kpi.changeType === 'negative' ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                <svg 
                  className={`w-4 h-4 mr-1 ${
                    kpi.changeType === 'positive' ? 'transform rotate-180' : ''
                  }`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {kpi.change}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface LoadingKPIsProps {
  count?: number;
}

export function LoadingKPIs({ count = 4 }: LoadingKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
