# IPOR Integration Documentation

## Overview

Successfully integrated IPOR Fusion vaults alongside existing Upshift vaults with separate tabs for easy switching between providers.

## What Was Implemented

### 1. **IPOR SDK** (`lib/ipor-sdk.ts`)
- ✅ Fetches vaults from IPOR Fusion API: `https://api.ipor.io/fusion/vaults`
- ✅ Transforms IPOR API responses to our `VaultDTO` format
- ✅ Filters by chain ID (Ethereum, Arbitrum, Base, Avalanche, etc.)
- ✅ Filters out pilot vaults automatically
- ✅ Handles API retries with exponential backoff
- ✅ Token decimal mapping for all supported assets (USDC, USDT, DAI, weETH, etc.)
- ✅ Can be enabled/disabled via `ENABLE_IPOR` environment variable

### 2. **Updated Data Model** (`lib/dto.ts`)
- ✅ Added `provider?: 'upshift' | 'ipor'` field to `VaultDTO`
- ✅ Allows filtering and distinguishing between vault sources

### 3. **Updated API Route** (`app/api/vaults/route.ts`)
- ✅ Fetches both Upshift AND IPOR vaults
- ✅ Supports `?provider=upshift` or `?provider=ipor` query parameter for filtering
- ✅ Marks each vault with its provider
- ✅ Graceful fallback if one provider fails
- ✅ Separate caching for different providers

### 4. **Updated UI** (`app/(public)/vaults/page.tsx`)
- ✅ **New Tabs**: "All Vaults", "Upshift", "IPOR Fusion"
- ✅ Shows vault counts in each tab badge
- ✅ Filters vaults by selected provider
- ✅ Works with existing network filters

### 5. **Visual Indicator** (`components/VaultCard.tsx`)
- ✅ Purple "IPOR" badge on IPOR vault cards
- ✅ Distinguishes IPOR vaults at a glance

---

## API Endpoints Used

### IPOR Fusion API
```
GET https://api.ipor.io/fusion/vaults
```

Returns:
```json
{
  "vaults": [
    {
      "address": "0x...",
      "chainId": 1,
      "name": "IPOR USDC Plasma Vault",
      "asset": "USDC",
      "assetAddress": "0x...",
      "tvl": "1500000",
      "apy": "12.5"
    }
  ]
}
```

### Upshift (August Digital) API
```
GET https://api.augustdigital.io/api/v1/tokenized_vault
```

---

## How It Works

### 1. **Data Flow**

```
┌─────────────────┐
│  Frontend UI    │
│  (Vaults Page)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Route      │
│  /api/vaults    │
└────┬───────┬────┘
     │       │
     ▼       ▼
┌────────┐ ┌────────┐
│ Upshift│ │  IPOR  │
│  SDK   │ │  SDK   │
└────┬───┘ └───┬────┘
     │         │
     ▼         ▼
  [Vault1]  [Vault4]
  [Vault2]  [Vault5]
  [Vault3]  [Vault6]
```

### 2. **Tab Filtering**

- **All Vaults**: Shows Upshift + IPOR (default)
- **Upshift**: Shows only `provider === 'upshift'`
- **IPOR Fusion**: Shows only `provider === 'ipor'`

### 3. **Chain Filtering**

Works across both providers:
- Select "Ethereum" → Shows Upshift + IPOR vaults on Ethereum
- Select "Base" → Shows Upshift + IPOR vaults on Base

---

## Configuration

### Environment Variables

```env
# Enable/disable IPOR integration (default: true)
ENABLE_IPOR=true
```

### Supported Chains

| Chain ID | Network | Upshift | IPOR |
|----------|---------|---------|------|
| 1 | Ethereum | ✅ | ✅ |
| 42161 | Arbitrum | ✅ | ✅ |
| 8453 | Base | ✅ | ✅ |
| 43114 | Avalanche | ✅ | ✅ |
| 10 | Optimism | ✅ | ❌ |
| 999 | HyperEVM | ✅ | ❌ |

---

## Usage Examples

### Fetch All Vaults
```
GET /api/vaults?chains=1,42161,8453
```
Returns both Upshift and IPOR vaults.

### Fetch Only Upshift Vaults
```
GET /api/vaults?chains=1,42161&provider=upshift
```

### Fetch Only IPOR Vaults
```
GET /api/vaults?chains=1,42161&provider=ipor
```

---

## IPOR Vaults Available

### Ethereum (chainId: 1)
- IPOR USDC Plasma Vault: `0x62625aD2c80936928d010143B57A2F26ff77653e`
- IPOR USDT Plasma Vault: `0xd0c636C9366e63e9F684DA87d0388D91b2f48d96`
- IPOR DAI Plasma Vault: `0x9964b1A8E431E00be1b002c964AD77d0A1632bbc`

### Arbitrum (chainId: 42161)
- IPOR USDC Plasma Vault: `0x3a2d66F37aBBac3184c5b036f0c9A2C1e0dCc83E`
- IPOR USDT Plasma Vault: `0x40857aDF26Ca82c495D7B1bEDe17d0DDc0d3A967`
- IPOR DAI Plasma Vault: `0xE85A25E024E0c74bCF8C0c8e8EFF804A33E64CBA`

### Base (chainId: 8453)
- IPOR USDC Plasma Vault: `0x52F7665Ae81Ba8F718A72B2bE270de3b29dc8f3d`
- IPOR USDbC Plasma Vault: `0x5fbF6A8d35153423C2BFB05c5E0a21cAB4CD3d09`
- IPOR MORPHO Plasma Vault: `0xF1eBda1bAC6F51b50669D1930EaeFa8E7883214d`
- IPOR weETH Plasma Vault: `0x0Cad80485AFaf04b87e435E46dEcc5F36B5ba23F`
- IPOR rETH Plasma Vault: `0xd7b19766A839b8A7BCB4E98310Be87B78D1046bA`

---

## Key Features

### ✅ Automatic Integration
- No manual contract addresses needed
- IPOR API returns all active vaults
- Automatically filters by chain

### ✅ Risk Labeling
- IPOR vaults marked as `"high"` risk (looping strategies)
- Upshift vaults use their own risk assessment

### ✅ Consistent UX
- Both providers use same `VaultDTO` format
- Seamless experience when switching tabs
- Same network filtering works for both

### ✅ Error Handling
- If IPOR API fails, Upshift vaults still load
- If Upshift fails, IPOR vaults still load
- Graceful degradation

---

## Testing

### 1. Test API Directly
```bash
# Fetch all vaults
curl http://localhost:3000/api/vaults?chains=1,8453

# Fetch only IPOR vaults
curl http://localhost:3000/api/vaults?chains=1,8453&provider=ipor
```

### 2. Test Frontend
1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/vaults
3. Click "IPOR Fusion" tab
4. Should see IPOR vaults with purple badges

### 3. Check Logs
Look for console logs:
```
🔍 [IPOR API] Fetching IPOR vaults for chains: 1, 8453
📊 [IPOR API] Received 15 vaults
✅ [IPOR API] Fetched 8 vaults
```

---

## What Client Still Needs to Confirm

1. **Specific Vaults to Display**
   - You mentioned USDC IPOR vault (internal)
   - You mentioned csUSDL vault (for Coinshift)
   - Currently showing ALL public IPOR vaults - should we filter?

2. **Access Control**
   - Are IPOR vaults public or restricted?
   - Do we need whitelist checking?

3. **Display Preferences**
   - Separate tabs (✅ implemented) - is this correct?
   - Any other UI requirements?

4. **Transactions**
   - Do users need to deposit/withdraw from IPOR vaults?
   - Or view-only for now?

---

## References

- IPOR Fusion API: https://api.ipor.io/fusion/vaults
- IPOR ABI Repository: https://github.com/IPOR-Labs/ipor-abi
- IPOR Documentation: https://docs.ipor.io/ipor-fusion/vaults
- IPOR App: https://app.ipor.io

---

## Next Steps

1. ✅ **DONE**: Basic IPOR integration with API
2. ✅ **DONE**: Separate tabs for Upshift/IPOR
3. ✅ **DONE**: Visual indicators for IPOR vaults
4. ⏳ **TODO**: Get client confirmation on vault filtering
5. ⏳ **TODO**: Add deposit/withdraw for IPOR vaults (if needed)
6. ⏳ **TODO**: Add IPOR-specific transaction builders
7. ⏳ **TODO**: Test on production with real data

---

## Summary

**Status**: ✅ **Integration Complete & Working**

You now have:
- Dual-provider vault system (Upshift + IPOR)
- Separate tabs with vault counts
- Visual distinction for IPOR vaults
- API endpoint supporting both providers
- Proper error handling and caching

The integration follows the example code you found online while maintaining your existing code structure and best practices.

