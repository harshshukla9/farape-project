# Claim Reward System Setup Guide

## Environment Variables Required

Add these to your `.env` or `.env.local` file:

```bash
# MongoDB Connection (already configured)
MONGODB_URI=your_mongodb_connection_string

# Server Private Key (used to sign reward claims)
# This should be the SAME private key used in your ClaimBox contract constructor
SERVER_PRIVATE_KEY=0xyour_private_key_here

# Token Reward Address (APRX token on Base)
NEXT_PUBLIC_TOKEN_REWARD_ADDRESS=0x905e5c99bd3af541033066db9e2dd7a44aa96b07

# Optional: API Secret Key (if you want additional API security)
NEXT_PUBLIC_API_SECRET_KEY=your_secret_key_here
```

## Smart Contract Setup

### 1. Contract Address Already Updated
The ClaimBox contract address is already set in `lib/contract.ts`:
```typescript
export const ClaimBoxContract = {
  address: "0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE",
  abi: [...]
}
```

### 2. Verify Contract Setup
Make sure your ClaimBox contract on Base:
- Has the correct `serverSigner` address (the address corresponding to your `SERVER_PRIVATE_KEY`)
- Has been funded with APRX tokens (0x905e5c99bd3af541033066db9e2dd7a44aa96b07)
- Is not paused (call `setPaused(false)` if needed)

### 3. Fund the Contract
You need to deposit APRX tokens into the contract:
1. Go to your APRX token contract on Base
2. Call `transfer(0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE, amount)`
3. Or use the contract's deposit function if available

## How It Works

### User Flow
1. User navigates to "Daily Rewards" page
2. Connects their wallet
3. Can claim up to 3 times per day
4. Each claim gives 10 APRX tokens
5. Resets every 24 hours at midnight UTC

### Backend Flow
1. User clicks "Claim Reward"
2. Frontend calls `/api/claim-reward` POST endpoint
3. Backend checks:
   - User hasn't exceeded daily limit (3 claims)
   - Generates a unique nonce
   - Signs the reward with the server private key
   - Stores claim record in MongoDB
4. Frontend receives signature + nonce
5. User's wallet calls `claimTokenReward()` on the smart contract
6. Contract verifies signature and transfers APRX tokens

### Security Features
- Rate limiting: 3 claims per day per wallet
- Server-side signature verification
- Nonce prevents replay attacks
- MongoDB tracks all claims

## Testing Checklist

- [ ] Environment variables are set
- [ ] MongoDB is connected
- [ ] ClaimBox contract has APRX tokens
- [ ] Server signer matches contract's serverSigner
- [ ] Wallet can connect
- [ ] Can claim reward successfully
- [ ] Daily limit works (try claiming 4 times)
- [ ] Tokens appear in wallet after claim

## Troubleshooting

### "Limit Reached" shows immediately
- Make sure wallet is connected
- Check browser console for API errors
- Verify MongoDB connection
- Check that API endpoints are accessible

### Transaction fails
- Verify contract has enough APRX tokens
- Check server signer address matches contract
- Ensure signature is valid
- Check contract is not paused

### Signature verification fails
- Ensure `SERVER_PRIVATE_KEY` matches the address set in contract constructor
- Check nonce is being passed correctly
- Verify signature format

## API Endpoints

### GET /api/claim-reward
Query params:
- `userAddress` (required)
- `fid` (optional)
- `stats=true` (optional, for full statistics)

Returns claim eligibility and statistics.

### POST /api/claim-reward
Body:
```json
{
  "userAddress": "0x...",
  "fid": 123456
}
```

Returns signature and claim data for on-chain transaction.

## Database Schema

Collection: `reward_claims`

Document structure:
```typescript
{
  walletAddress: string (lowercase)
  fid: number | null
  tokenAddress: string
  amount: string
  amountInWei: string
  nonce: string
  signature: string
  timestamp: number
  claimed: boolean
  claimedAt?: number
}
```

## Configuration

You can adjust these in `lib/rewards.ts`:

```typescript
const MAX_CLAIMS_PER_DAY = 3; // Maximum claims per user per day
const REWARD_AMOUNT = '10'; // APRX tokens per claim
```

