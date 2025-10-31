/**
 * POST /api/tx/deposit
 * Builds deposit transaction for a vault
 */

import { NextRequest, NextResponse } from 'next/server';
import { depositTxSchema } from '@/lib/zodSchemas';
import { createSdkClient, isSupportedNetwork } from '@/lib/sdk';
import { TransactionResponse } from '@/lib/dto';
import { normalizeToString } from '@/lib/normalize';

// Handle preflight to avoid 405 noise in dev
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedBody = depositTxSchema.parse(body);
    const { chain, vault, owner, amount } = validatedBody;

    // Check if chain is supported
    if (!isSupportedNetwork(chain)) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chain}` },
        { status: 400 }
      );
    }

    // Create SDK client and build transaction
    const sdk = createSdkClient(chain);
    
    // Normalize amount to ensure it's a valid decimal string
    const normalizedAmount = normalizeToString(amount);
    
    if (!normalizedAmount || normalizedAmount === '0') {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Build the deposit transaction
    const txData = await sdk.buildDepositTx(vault, normalizedAmount, owner);

    const response: TransactionResponse = {
      to: txData.to,
      data: txData.data,
      value: txData.value,
      gasLimit: txData.gasLimit
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in /api/tx/deposit:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to build deposit transaction' },
      { status: 500 }
    );
  }
}
