/**
 * Tests for vaults API endpoint
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/vaults/route';

// Mock the SDK and dependencies
jest.mock('@/lib/sdk', () => ({
  createSdkClient: jest.fn(() => ({
    getVaults: jest.fn(() => Promise.resolve([
      {
        id: 'test-vault-1',
        address: '0x1234567890123456789012345678901234567890',
        name: 'Test USDC Vault',
        symbol: 'yvUSDC',
        tvl: '1000000.50',
        apy: '5.25',
        underlying: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C',
        fees: {
          management: '200',
          performance: '1000'
        },
        strategy: {
          name: 'Test Strategy',
          description: 'Test strategy description',
          riskLevel: 'medium'
        }
      }
    ]))
  })),
  getSupportedNetworks: jest.fn(() => [1, 42161])
}));

jest.mock('@/lib/underlying', () => ({
  getVaultUnderlying: jest.fn(() => ({
    symbol: 'USDC',
    address: '0xA0b86a33E6441b8c4C8C0C4C8C0C4C8C0C4C8C0C',
    decimals: 6,
    isWrapped: false
  }))
}));

jest.mock('@/lib/oracles', () => ({
  getUsdValue: jest.fn(() => Promise.resolve('1000000.50'))
}));

jest.mock('@/lib/cache', () => ({
  cache: {
    get: jest.fn(() => null),
    set: jest.fn()
  },
  CacheKeys: {
    vaults: jest.fn(() => 'vaults:1,42161')
  },
  CacheTTL: {
    VAULTS_LIST: 15000
  }
}));

describe('/api/vaults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return vaults list successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/vaults');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    
    const vault = data[0];
    expect(vault).toHaveProperty('id');
    expect(vault).toHaveProperty('chainId');
    expect(vault).toHaveProperty('name');
    expect(vault).toHaveProperty('symbol');
    expect(vault).toHaveProperty('tvlUsd');
    expect(vault).toHaveProperty('apyNet');
    expect(vault).toHaveProperty('underlying');
  });

  it('should handle query parameters correctly', async () => {
    const request = new NextRequest('http://localhost:3000/api/vaults?chains=1,10');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return error for invalid query parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/vaults?chains=invalid');
    const response = await GET(request);
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should handle empty chains parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/vaults');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
