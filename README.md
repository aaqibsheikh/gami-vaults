# Gami Vaults

A production-ready Next.js application for accessing yield vaults across multiple blockchain networks, powered by the August Digital API. Built with TypeScript, wagmi, viem, and React Query for a seamless DeFi experience.

## 🔗 August Digital Integration

This application integrates with the [August Digital API](https://docs.augustdigital.io/developers/api-reference/vaults) to provide access to their tokenized vault ecosystem, including:

- **Vault Discovery**: Browse all available tokenized vaults with filtering by status
- **Performance Analytics**: Real-time APY calculations and performance metrics
- **Withdrawal Management**: Monitor pending withdrawals and redemption activities
- **Multi-Chain Support**: Access vaults across Ethereum, Arbitrum, Optimism, and Base networks

## Features

- 🌐 **Multi-Network Support**: Ethereum, Arbitrum, Optimism, and Base
- 💰 **Yield Vaults**: Browse and invest in automated yield strategies
- 📊 **Portfolio Management**: Track positions, P&L, and claimable rewards
- 🔒 **Secure**: Server-side API keys and client-side wallet integration
- 📱 **Responsive**: Modern UI with TailwindCSS
- ⚡ **Fast**: Optimized with React Query caching and Next.js 14

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Wallet**: wagmi + viem
- **Data Fetching**: React Query (TanStack Query)
- **Validation**: Zod
- **HTTP Client**: Axios
- **Date Handling**: Day.js
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gami-vaults
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   ```env
   # August Digital API (public endpoints - no key required)
   AUGUST_API_KEY=your_august_api_key_here
   
   # RPC Endpoints for wallet connections
   RPC_1=https://mainnet.infura.io/v3/YOUR_KEY
   RPC_42161=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
   RPC_10=https://optimism-mainnet.g.alchemy.com/v2/YOUR_KEY
   RPC_8453=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
   
   # Supported networks
   NETWORKS=1,42161,10,8453
   ORACLE_POLICY=ibt-native
   ENABLE_IPOR=false
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AUGUST_API_KEY` | August Digital API key (optional - public endpoints available) | No |
| `RPC_1` | Ethereum mainnet RPC URL | Yes |
| `RPC_42161` | Arbitrum RPC URL | Yes |
| `RPC_10` | Optimism RPC URL | Yes |
| `RPC_8453` | Base RPC URL | Yes |
| `NETWORKS` | Comma-separated supported chain IDs | Yes |
| `ORACLE_POLICY` | Oracle policy configuration | No |
| `ENABLE_IPOR` | Enable IPOR integration | No |

## Project Structure

```
gami-vaults/
├── app/                          # Next.js App Router
│   ├── (public)/                # Public routes
│   │   ├── vaults/              # Vaults pages
│   │   └── portfolio/           # Portfolio page
│   ├── api/                     # API routes
│   │   ├── vaults/              # Vault endpoints
│   │   ├── portfolio/           # Portfolio endpoint
│   │   ├── redemptions/         # Redemptions endpoint
│   │   └── tx/                  # Transaction endpoints
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── VaultCard.tsx           # Vault display card
│   ├── KPIs.tsx                # Key performance indicators
│   ├── DepositForm.tsx         # Deposit form
│   ├── WithdrawForm.tsx        # Withdraw form
│   ├── PortfolioTable.tsx      # Portfolio positions table
│   └── NetworkSelector.tsx     # Network selection
├── hooks/                       # Custom React hooks
│   ├── useVaults.ts            # Vaults data fetching
│   ├── useVault.ts             # Single vault data
│   ├── usePortfolio.ts         # Portfolio data
│   └── useRedemptions.ts       # Redemptions data
├── lib/                         # Core libraries
│   ├── sdk.ts                  # SDK initialization
│   ├── dto.ts                  # Data transfer objects
│   ├── normalize.ts            # Number normalization
│   ├── cache.ts                # Caching utilities
│   ├── oracles.ts              # Price feed integration
│   ├── underlying.ts           # Token unwrapping
│   └── zodSchemas.ts           # Validation schemas
├── styles/                      # Stylesheets
│   └── globals.css             # Global CSS
└── __tests__/                   # Test files
    ├── lib/                    # Library tests
    └── api/                    # API tests
```

## API Endpoints

### Vaults
- `GET /api/vaults?chains=1,42161` - List vaults across chains
- `GET /api/vaults/[chainId]/[vault]` - Get vault details

### Portfolio
- `GET /api/portfolio?chain=1&address=0x...` - Get user portfolio
- `GET /api/redemptions?chain=1&vault=0x...&address=0x...` - Get claimable amounts

### Transactions
- `POST /api/tx/deposit` - Build deposit transaction
- `POST /api/tx/withdraw` - Build withdrawal transaction

## Usage

### Connecting a Wallet

1. Click "Connect Wallet" on any page
2. Select your preferred wallet (MetaMask, WalletConnect, Coinbase Wallet)
3. Approve the connection in your wallet

### Browsing Vaults

1. Navigate to the Vaults page
2. Select networks using the network selector
3. Search and filter vaults by name, symbol, or underlying token
4. Sort by APY, TVL, or name
5. Click on a vault to view details

### Depositing

1. Select a vault from the list
2. Click "Deposit" tab
3. Enter the amount you want to deposit
4. Approve the underlying token if needed
5. Confirm the deposit transaction

### Withdrawing

1. Go to your Portfolio page
2. Find the vault position you want to withdraw from
3. Click "View Details" to expand
4. Enter the number of shares to withdraw
5. Confirm the withdrawal transaction

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Adding a New Network

1. **Update environment variables**
   ```env
   RPC_[CHAIN_ID]=https://your-rpc-url
   NETWORKS=1,42161,10,8453,NEW_CHAIN_ID
   ```

2. **Add network configuration**
   ```typescript
   // lib/sdk.ts
   export const NETWORKS: Record<number, NetworkConfig> = {
     // ... existing networks
     NEW_CHAIN_ID: {
       chainId: NEW_CHAIN_ID,
       name: 'New Network',
       rpcUrl: process.env.RPC_NEW_CHAIN_ID,
       explorerUrl: 'https://explorer.new-network.com',
       nativeCurrency: {
         name: 'New Token',
         symbol: 'NEW',
         decimals: 18
       }
     }
   };
   ```

3. **Add to wagmi config**
   ```typescript
   // app/providers.tsx
   import { newNetwork } from 'viem/chains';
   
   const config = createConfig({
     chains: [mainnet, arbitrum, optimism, base, newNetwork],
     // ...
   });
   ```

### Security Considerations

- **API Keys**: Never expose API keys to the client. All sensitive operations are server-side only.
- **Input Validation**: All user inputs are validated using Zod schemas.
- **Rate Limiting**: Consider implementing rate limiting for production use.
- **CORS**: Configure CORS policies for production deployment.
- **HTTPS**: Always use HTTPS in production.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@gamivaults.com or join our Discord community.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Additional blockchain networks
- [ ] Advanced portfolio analytics
- [ ] Social trading features
- [ ] Governance integration
- [ ] Cross-chain bridging