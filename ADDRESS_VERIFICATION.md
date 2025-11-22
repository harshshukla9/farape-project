# Address Verification Guide

## Check Your Addresses on BaseScan

### 1. Contract Address
**Address**: `0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE`

**Check on BaseScan**:
```
https://basescan.org/address/0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE
```

**What to verify**:
- ✅ Contract is verified (shows source code)
- ✅ Contract name matches "ClaimBox" or your contract name
- ✅ No suspicious transactions
- ✅ Contract was deployed by you or your team

### 2. APRX Token Address
**Address**: `0x905e5c99bd3af541033066db9e2dd7a44aa96b07`

**Check on BaseScan**:
```
https://basescan.org/token/0x905e5c99bd3af541033066db9e2dd7a44aa96b07
```

**What to verify**:
- ✅ Token symbol is "APRX"
- ✅ Token name matches
- ✅ No reports of malicious activity
- ✅ Token is legitimate

## Why You're Getting the Warning

### Common Reasons:

1. **New/Unverified Contract**
   - MetaMask flags unverified contracts as potentially risky
   - **Solution**: Verify your contract on BaseScan

2. **Contract Not in MetaMask's Database**
   - New contracts aren't in MetaMask's trusted database
   - **Solution**: This is normal for new contracts

3. **False Positive**
   - Security databases sometimes flag legitimate contracts
   - **Solution**: Verify the addresses yourself on BaseScan

4. **Address Reuse**
   - If the contract address was used before, it might be flagged
   - **Solution**: Check transaction history on BaseScan

## How to Verify Your Contract is Safe

### Step 1: Check Contract on BaseScan
1. Visit: `https://basescan.org/address/0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE`
2. Look for:
   - ✅ "Contract" tab shows verified source code
   - ✅ Contract name matches what you deployed
   - ✅ No suspicious activity in transactions

### Step 2: Verify Contract Source Code
If contract is verified:
- ✅ You can see the exact code
- ✅ Verify it matches your ClaimBox contract
- ✅ Check for any suspicious functions

### Step 3: Check Token Address
1. Visit: `https://basescan.org/token/0x905e5c99bd3af541033066db9e2dd7a44aa96b07`
2. Verify:
   - ✅ Token symbol is "APRX"
   - ✅ Token name is correct
   - ✅ No reports of scams

## Solutions

### Option 1: Verify Your Contract on BaseScan (Recommended)
1. Go to BaseScan
2. Navigate to your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Follow the verification process
6. Once verified, MetaMask warnings should reduce

### Option 2: Add to MetaMask's Allowlist (If Possible)
- Some wallets allow you to mark addresses as trusted
- Check your wallet's settings

### Option 3: Inform Users
If the contract is legitimate:
- Add a note in your UI explaining the warning
- Link to BaseScan verification
- Show that the contract is verified

### Option 4: Use a Different Contract Address
If the address is truly problematic:
- Deploy a new contract
- Update `CLAIM_CONTRACT_ADDRESS` in your code
- Use the new address

## Quick Check Commands

### Check if contract is verified:
```bash
# Visit BaseScan and check "Contract" tab
https://basescan.org/address/0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE#code
```

### Check contract transactions:
```bash
# Visit BaseScan transactions tab
https://basescan.org/address/0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE#txs
```

### Check token details:
```bash
# Visit token page
https://basescan.org/token/0x905e5c99bd3af541033066db9e2dd7a44aa96b07
```

## Most Likely Cause

**99% chance**: Your contract is **new/unverified**, and MetaMask is being cautious.

**Solution**: 
1. Verify your contract on BaseScan
2. Once verified, the warning should go away or reduce
3. This is a normal security feature, not necessarily a problem

## If Address is Actually Malicious

If you discover the address is truly malicious:
1. **STOP** using it immediately
2. Deploy a new contract
3. Update your code with the new address
4. Notify users if needed

## For Your Users

Add this to your UI to help users:

```typescript
// In DailyReward.tsx, add a note:
<div className="bg-yellow-500/20 border border-yellow-500 rounded p-2 text-xs">
  ⚠️ MetaMask may show a security warning. This is normal for new contracts.
  <br />
  Contract verified on BaseScan: 
  <a href="https://basescan.org/address/0x7AdCc5ECf993a032b2C861eCDe8832dD459950AE" 
     target="_blank" className="underline">
    View Contract
  </a>
</div>
```

