# 🔧 Signature Fix V2 - Based on Working Flapbitrum Implementation

## Changes Made

### 1. ✅ Raw Signature (No Message Prefix)

**Changed from:**
```typescript
// ❌ WRONG - Adds Ethereum message prefix
const signature = await signer.signMessage(messageHashBytes);
```

**Changed to:**
```typescript
// ✅ CORRECT - Raw signature matching contract's ECDSA.recover
const signature = signer.signingKey.sign(messageHash).serialized;
```

**Why:** Your contract uses `ECDSA.recover` directly on the hash, not on the message-prefixed hash.

### 2. ✅ Read Nonce from Contract

**Changed from:**
```typescript
// ❌ WRONG - Generating nonce locally
const nonce = BigInt(Date.now());
```

**Changed to:**
```typescript
// ✅ CORRECT - Reading nonce from contract
const currentNonce = await contract.userNonce(userAddress);
nonce = BigInt(currentNonce.toString());
```

**Why:** The contract tracks nonces per user. Using the contract's nonce ensures it matches exactly.

### 3. ✅ On-Chain Verification

Added automatic signature verification before returning to user:
- Tests signature on-chain using contract's `verifySignature`
- Logs success/failure for debugging
- Helps identify issues immediately

## Environment Variables Required

Add to `.env.local`:

```bash
# Base RPC URL (required for reading nonce from contract)
BASE_RPC_URL=https://mainnet.base.org
# OR use Alchemy/Infura:
# BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Fallback RPC URL
RPC_URL=https://mainnet.base.org

# APRX Token Address
NEXT_PUBLIC_TOKEN_REWARD_ADDRESS=0x905e5c99bd3af541033066db9e2dd7a44aa96b07

# Server Private Key (must match contract's serverSigner)
SERVER_PRIVATE_KEY=0x_your_private_key_here

# MongoDB
MONGODB_URI=your_mongodb_uri
```

## Testing

### 1. Check Environment
```bash
curl http://localhost:3000/api/check-env
```

### 2. Full Diagnostic
```bash
curl http://localhost:3000/api/diagnose-claim
```

### 3. Test Claim
1. Connect wallet
2. Go to Daily Rewards
3. Click "Claim Reward"
4. Check terminal logs for:
   - `[claimReward] Read nonce from contract: X`
   - `[claimReward] On-chain signature verification: ✅ VALID`

## Expected Log Output

When working correctly, you should see:

```
[claimReward] Read nonce from contract: 0
[claimReward] Generating signature...
[generateRewardSignature] Signing with address: 0x...
[generateRewardSignature] Message hash: 0x...
[generateRewardSignature] Generated RAW signature: 0x...
[claimReward] Signature generated: 0x...
[claimReward] On-chain signature verification: ✅ VALID
```

## If Still Getting InvalidSignature

### Check 1: Server Signer Address
```bash
# Run diagnostic endpoint
curl http://localhost:3000/api/diagnose-claim
```

Look for:
- `addressMatch.matches: true` ✅
- `addressMatch.matches: false` ❌ → Fix SERVER_PRIVATE_KEY

### Check 2: RPC Connection
The code needs to read nonce from contract. If RPC fails:
- Check `BASE_RPC_URL` or `RPC_URL` is set
- Test RPC connection manually
- Fallback uses timestamp (may cause issues)

### Check 3: Signature Format
The code tries raw signature first. If that fails, it falls back to message-prefixed.

Check logs for:
- `Generated RAW signature` → Contract expects raw
- `Generated message-prefixed signature` → Contract expects prefixed

### Check 4: Contract Verification
The code automatically verifies on-chain. Check logs:
- `✅ VALID` → Signature is correct
- `❌ INVALID` → Check server signer, nonce, or format

## Key Differences from Previous Version

| Aspect | Old (Wrong) | New (Correct) |
|--------|-------------|---------------|
| **Signature** | `signMessage()` (with prefix) | `signingKey.sign().serialized` (raw) |
| **Nonce** | `Date.now()` (local) | `contract.userNonce()` (on-chain) |
| **Verification** | None | On-chain before return |
| **User Address** | Mixed case | Lowercase (`.toLowerCase()`) |

## Matching Your Working Flapbitrum Code

This implementation now matches your working Arbitrum code:

✅ 5 parameters in signature (includes contract address)
✅ Raw signature (no message prefix)
✅ Nonce from contract
✅ Lowercase user address
✅ On-chain verification

## Next Steps

1. **Set RPC URL** in `.env.local`
2. **Restart server** after changes
3. **Test claim** and check logs
4. **Verify** signature shows `✅ VALID` in logs

If signature still fails after these changes, the issue is likely:
- Server signer address mismatch
- Contract expects different signature format (check contract code)
- RPC connection issues preventing nonce read

