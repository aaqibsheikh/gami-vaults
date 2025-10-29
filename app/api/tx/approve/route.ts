/**
 * POST /api/tx/approve
 * Builds ERC20 approval transaction for a spender
 */

import { NextRequest, NextResponse } from 'next/server';
import { addressSchema, chainIdSchema, decimalStringSchema } from '@/lib/zodSchemas';
import { createSdkClient, isSupportedNetwork } from '@/lib/sdk';
import { TransactionResponse } from '@/lib/dto';

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
  try {
    const body = await request.json();
    const { chain, token, spender, amount } = approveSchema.parse(body);

    if (!isSupportedNetwork(chain)) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chain}` },
        { status: 400 }
      );
    }

    const sdk = createSdkClient(chain);
    const txData = await sdk.buildApprovalTx(token, spender, amount);

    const response: TransactionResponse = {
      to: txData.to,
      data: txData.data,
      value: txData.value,
      gasLimit: txData.gasLimit
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/tx/approve:', error);
    return NextResponse.json(
      { error: 'Failed to build approval transaction' },
      { status: 500 }
    );
  }
}


