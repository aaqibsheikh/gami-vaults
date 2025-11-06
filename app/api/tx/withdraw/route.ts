/**
 * POST /api/tx/withdraw
 * Builds withdrawal transaction for a vault
 */

import { NextRequest, NextResponse } from 'next/server';
import { withdrawTxSchema } from '@/lib/zodSchemas';
import { createSdkClient, isSupportedNetwork } from '@/lib/sdk';
import { TransactionResponse } from '@/lib/dto';
import { normalizeToString } from '@/lib/normalize';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedBody = withdrawTxSchema.parse(body);
    const { chain, vault, owner, shares } = validatedBody;
    const provider = body.provider as 'upshift' | 'ipor' | 'lagoon' | undefined;

    // Check if chain is supported
    if (!isSupportedNetwork(chain)) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chain}` },
        { status: 400 }
      );
    }

    // Create SDK client and build transaction
    const sdk = createSdkClient(chain);
    
    // Normalize shares to ensure it's a valid decimal string
    const normalizedShares = normalizeToString(shares);
    
    if (!normalizedShares || normalizedShares === '0') {
      return NextResponse.json(
        { error: 'Invalid shares amount' },
        { status: 400 }
      );
    }

    // Build the withdrawal transaction (pass provider for Lagoon vaults)
    const txData = await sdk.buildWithdrawTx(vault, normalizedShares, owner, provider);

    const response: TransactionResponse = {
      to: txData.to,
      data: txData.data,
      value: txData.value,
      gasLimit: txData.gasLimit
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in /api/tx/withdraw:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to build withdrawal transaction' },
      { status: 500 }
    );
  }
}
