import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic';

// Get server signer
function getServerSigner() {
  const privateKey = process.env.SERVER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('SERVER_PRIVATE_KEY not configured');
  }
  return new ethers.Wallet(privateKey);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress') || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
    const tokenAddress = searchParams.get('tokenAddress') || process.env.NEXT_PUBLIC_TOKEN_REWARD_ADDRESS || '0x905e5c99bd3af541033066db9e2dd7a44aa96b07';
    const amount = searchParams.get('amount') || '10';
    
    const signer = getServerSigner();
    const amountInWei = ethers.parseEther(amount);
    const nonce = BigInt(Date.now());
    const contractAddress = '0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE';
    
    console.log('=== Test Signature Generation ===');
    console.log('Server signer address:', signer.address);
    console.log('User address:', userAddress);
    console.log('Token address:', tokenAddress);
    console.log('Contract address:', contractAddress);
    console.log('Amount (wei):', amountInWei.toString());
    console.log('Nonce:', nonce.toString());
    
    // Method 1: CORRECT METHOD - Includes contract address (matches flapbitrum working code)
    const packedData1 = ethers.solidityPacked(
      ['address', 'address', 'uint256', 'uint256', 'address'],
      [userAddress, tokenAddress, amountInWei, nonce, contractAddress]
    );
    const messageHash1 = ethers.keccak256(packedData1);
    const messageHashBytes1 = ethers.getBytes(messageHash1);
    const signature1 = await signer.signMessage(messageHashBytes1);
    
    console.log('Method 1 (CORRECT - with contract address):');
    console.log('  Message hash:', messageHash1);
    console.log('  Signature:', signature1);
    
    // Method 2: WRONG - Missing contract address (for comparison)
    const messageHash2 = ethers.solidityPackedKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [userAddress, tokenAddress, amountInWei, nonce]
    );
    const messageHashBytes2 = ethers.getBytes(messageHash2);
    const signature2 = await signer.signMessage(messageHashBytes2);
    
    console.log('Method 2 (WRONG - missing contract address):');
    console.log('  Message hash:', messageHash2);
    console.log('  Signature:', signature2);
    
    return NextResponse.json({
      success: true,
      serverSigner: signer.address,
      parameters: {
        userAddress,
        tokenAddress,
        contractAddress,
        amountInWei: amountInWei.toString(),
        nonce: nonce.toString()
      },
      messageHashes: {
        correct: messageHash1,
        wrong: messageHash2
      },
      signatures: {
        method1_CORRECT: signature1,
        method2_WRONG: signature2
      },
      important: [
        '✅ Method 1 is CORRECT - includes contract address (5 parameters)',
        '❌ Method 2 is WRONG - missing contract address (4 parameters)',
        '',
        `Current server signer: ${signer.address}`,
        `Contract address: ${contractAddress}`,
        '',
        '⚠️ Make sure your SERVER_PRIVATE_KEY matches the serverSigner in your contract!',
        'The signature MUST include the contract address to prevent replay attacks'
      ]
    });
  } catch (error) {
    console.error('Error testing signature:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

