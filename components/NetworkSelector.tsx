/**
 * NetworkSelector component for choosing blockchain networks
 */

'use client';

import { useState } from 'react';
import { useSwitchChain } from 'wagmi';
import { getSupportedNetworks, getNetworkConfig } from '@/lib/sdk';

interface NetworkSelectorProps {
  selectedChains: number[];
  onChainsChange: (chains: number[]) => void;
  className?: string;
}

export function NetworkSelector({ selectedChains, onChainsChange, className = '' }: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { switchChain } = useSwitchChain();

  const supportedNetworks = getSupportedNetworks();

  const handleChainToggle = (chainId: number) => {
    if (selectedChains.includes(chainId)) {
      onChainsChange(selectedChains.filter(id => id !== chainId));
    } else {
      onChainsChange([...selectedChains, chainId]);
    }
  };

  const handleSelectAll = () => {
    onChainsChange(supportedNetworks);
  };

  const handleSelectNone = () => {
    onChainsChange([]);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <span>
          {selectedChains.length === 0 
            ? 'Select Networks' 
            : `${selectedChains.length} network${selectedChains.length > 1 ? 's' : ''} selected`
          }
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Select All
              </button>
              <button
                onClick={handleSelectNone}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Select None
              </button>
            </div>
          </div>
          
          <div className="py-1 max-h-48 overflow-y-auto">
            {supportedNetworks.map((chainId) => {
              const network = getNetworkConfig(chainId);
              const isSelected = selectedChains.includes(chainId);
              
              return (
                <label
                  key={chainId}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleChainToggle(chainId)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-semibold text-gray-600">
                        {network?.nativeCurrency.symbol || 'ETH'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {network?.name || `Chain ${chainId}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        Chain ID: {chainId}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface NetworkBadgeProps {
  chainId: number;
  onRemove?: (chainId: number) => void;
  showRemove?: boolean;
}

export function NetworkBadge({ chainId, onRemove, showRemove = false }: NetworkBadgeProps) {
  const network = getNetworkConfig(chainId);

  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      <div className="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>
      {network?.name || `Chain ${chainId}`}
      {showRemove && onRemove && (
        <button
          onClick={() => onRemove(chainId)}
          className="ml-1 text-blue-600 hover:text-blue-800"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}

interface NetworkChipsProps {
  selectedChains: number[];
  onChainRemove: (chainId: number) => void;
}

export function NetworkChips({ selectedChains, onChainRemove }: NetworkChipsProps) {
  if (selectedChains.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No networks selected
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedChains.map((chainId) => (
        <NetworkBadge
          key={chainId}
          chainId={chainId}
          onRemove={onChainRemove}
          showRemove={true}
        />
      ))}
    </div>
  );
}
