/**
 * POST /api/tx/approve
 * Builds ERC20 approval transaction for a spender
 */

import { NextRequest, NextResponse } from 'next/server';
import { addressSchema, chainIdSchema, decimalStringSchema } from '@/lib/zodSchemas';
import { createSdkClient, isSupportedNetwork } from '@/lib/sdk';
import { TransactionResponse } from '@/lib/dto';

// Avoid 405s from dev service worker prefetch by responding to GET/OPTIONS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Accept'
    }
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Use POST to build approval transaction' });
}

const approveSchema = {
  parse(body: any) {
    const chain = chainIdSchema.parse(body.chain);
    const token = addressSchema.parse(body.token);
    const spender = addressSchema.parse(body.spender);
    const amount = decimalStringSchema.parse(body.amount);
    return { chain, token, spender, amount };
  }
};

export async function POST(request: NextRequest) {
  console.log('[APPROVE ROUTE] POST handler called at', new Date().toISOString());
  console.log('[APPROVE ROUTE] Request method:', request.method);
  console.log('[APPROVE ROUTE] Request URL:', request.url);
  
  try {
    const body = await request.json();
    console.log('[APPROVE ROUTE] Request body:', body);
    const { chain, token, spender, amount } = approveSchema.parse(body);

    if (!isSupportedNetwork(chain)) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chain}` },
        { status: 400 }
      );
    }

    const sdk = createSdkClient(chain);
    const txData = await sdk.buildApprovalTx(token, spender, amount);
    console.log('[APPROVE ROUTE] Built transaction:', { to: txData.to, dataLength: txData.data?.length });

    const response: TransactionResponse = {
      to: txData.to,
      data: txData.data,
      value: txData.value,
      gasLimit: txData.gasLimit
    };

    console.log('[APPROVE ROUTE] Returning response');
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[APPROVE ROUTE] Error:', error);
    
    // Handle validation errors
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to build approval transaction' },
      { status: 500 }
    );
  }
}

