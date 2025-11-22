import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_REWARD_ADDRESS;
  const serverPrivateKey = process.env.SERVER_PRIVATE_KEY;
  const mongoUri = process.env.MONGODB_URI;
  
  return NextResponse.json({
    environment: {
      NEXT_PUBLIC_TOKEN_REWARD_ADDRESS: tokenAddress || 'NOT_SET',
      NEXT_PUBLIC_TOKEN_REWARD_ADDRESS_isCorrect: tokenAddress === '0x905e5c99bd3af541033066db9e2dd7a44aa96b07',
      SERVER_PRIVATE_KEY: serverPrivateKey ? `SET (${serverPrivateKey.substring(0, 10)}...)` : 'NOT_SET',
      MONGODB_URI: mongoUri ? 'SET' : 'NOT_SET'
    },
    expectedValues: {
      NEXT_PUBLIC_TOKEN_REWARD_ADDRESS: '0x905e5c99bd3af541033066db9e2dd7a44aa96b07',
      note: 'This is the APRX token address on Base'
    },
    diagnosis: tokenAddress === '0x905e5c99bd3af541033066db9e2dd7a44aa96b07' 
      ? '✅ NEXT_PUBLIC_TOKEN_REWARD_ADDRESS is correct!'
      : `❌ NEXT_PUBLIC_TOKEN_REWARD_ADDRESS is ${tokenAddress ? 'WRONG' : 'NOT SET'}!`,
    fix: tokenAddress !== '0x905e5c99bd3af541033066db9e2dd7a44aa96b07'
      ? 'Add this to your .env.local file:\nNEXT_PUBLIC_TOKEN_REWARD_ADDRESS=0x905e5c99bd3af541033066db9e2dd7a44aa96b07\n\nThen restart your dev server!'
      : 'Environment is configured correctly'
  });
}

