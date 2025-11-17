# Smart Contract Integration - GameTracker

## Overview

This game integrates with a GameTracker smart contract deployed on Base that records every game session on-chain. Players must submit a transaction to the contract before they can play the game.

## Contract Details

- **Contract Address**: `0xfc0e190cc09D098475085e9bedfF1E5BDe790DbB`
- **Network**: Base (Chain ID: 8453)
- **Contract Name**: GameTracker

## Smart Contract Functions

### `startGame()`
- **Type**: Write function (requires transaction)
- **Purpose**: Called when a player starts a game session
- **Actions**:
  - Registers new players automatically
  - Increments player's game count
  - Updates last played timestamp
  - Increments global game counter
- **Events Emitted**:
  - `GameStarted(address indexed player, uint256 gameCount, uint256 timestamp)`
  - `NewPlayer(address indexed player, uint256 timestamp)` (for first-time players)

### `getPlayerStats(address _player)`
- **Type**: Read function (no transaction needed)
- **Returns**: `totalGames`, `lastPlayed`, `isRegistered`

### `getTopPlayers(uint256 _limit)`
- **Type**: Read function
- **Returns**: Arrays of top player addresses and their game counts

### `getTotalPlayers()`
- **Type**: Read function
- **Returns**: Total number of registered players

### `getPlayerRank(address _player)`
- **Type**: Read function
- **Returns**: Player's rank based on total games played

## Implementation Flow

### 1. Home Screen - Regular Play
```
User clicks "PLAY" button
  ↓
Check wallet connection
  ↓
Call startGame() contract function
  ↓
Wait for transaction confirmation
  ↓
Start game
```

### 2. Tournament - Public & NFT
```
User clicks "Enter Tournament"
  ↓
Check wallet connection
  ↓
Check NFT status (if NFT tournament)
  ↓
Call startGame() contract function
  ↓
Wait for transaction confirmation
  ↓
Register tournament entry in database
  ↓
Start game in tournament mode
```

## Code Structure

### Hook: `smartcontracthooks/useStartGame.ts`
- `useStartGame()`: Manages the contract transaction
  - Returns: `{ startGame, isPending, isSuccess, error, reset }`
  - Handles wallet connection
  - Submits transaction
  - Waits for confirmation

- `useGameTrackerStats()`: Fetches player statistics
  - Returns: `{ playerStats, isLoading, error, fetchPlayerStats }`
  - Reads on-chain data without transactions

### Components Integration

#### `components/MainMenu.tsx`
- Imports `useStartGame` hook
- Calls `startGame()` before game starts
- Shows transaction status
- Displays wallet connection warnings
- Button states: `PLAY` → `⏳ Starting...` → Game starts

#### `components/pages/Tournament.tsx`
- Imports `useStartGame` hook
- Calls `startGame()` before tournament entry
- Transaction flow:
  1. Submit contract transaction
  2. Register in database
  3. Start game
- Shows detailed transaction progress:
  - "Initiating transaction..."
  - "Transaction confirmed! Entering tournament..."
  - "Starting game..."

## User Experience

### Before Playing
- User must have wallet connected
- User must approve transaction in their wallet
- Transaction must be confirmed on-chain

### Transaction States
1. **Idle**: "PLAY" or "Enter Tournament" button visible
2. **Pending**: "⏳ Starting..." or "⏳ Processing..." shown
3. **Confirming**: "Transaction confirmed! Starting game..."
4. **Success**: Game starts automatically

### Error Handling
- Wallet not connected → Alert user
- Transaction rejected → Show error message
- Transaction failed → Alert with error details

## Gas Fees

- Each game session requires a small gas fee on Base
- Base has very low gas fees (typically < $0.01)
- Users pay in ETH (on Base network)

## Benefits

1. **On-Chain Verification**: Every game session is recorded on blockchain
2. **Anti-Cheat**: Harder to fake game sessions
3. **Player Statistics**: Immutable record of games played
4. **Leaderboard**: Can combine on-chain data with off-chain scores
5. **Provenance**: Transparent player history

## Future Enhancements

Potential additions:
- Record scores on-chain
- Reward distribution via smart contract
- NFT minting for achievements
- Staking mechanisms
- Tournament prize pools in smart contracts

## Testing

### Testnet
- Deploy contract on Base Sepolia first
- Update contract address in `lib/contract.ts`
- Test with testnet ETH

### Mainnet
- Ensure sufficient testing on testnet
- Update to mainnet address
- Verify contract on BaseScan
- Test with small amounts first

## Contract ABI Location

- **File**: `lib/contract.ts`
- **Export**: `StartGameContract`
- Contains both address and full ABI

## Wallet Requirements

Users need:
1. Wallet with Base network added
2. Small amount of ETH on Base for gas
3. Wallet connected to the app (via WalletConnect or similar)

## Error Messages

Common errors:
- "Wallet not connected" → User needs to connect wallet
- "User rejected transaction" → User cancelled in wallet
- "Insufficient funds" → User needs ETH for gas
- "Transaction failed" → Could be network or contract issue

## Monitoring

Track these metrics:
- Total games played (from contract)
- Transaction success rate
- Average gas cost per transaction
- Failed transaction reasons
- User drop-off at transaction step

---

**Note**: This integration makes the game more robust and verifiable, but adds friction (transaction approval). Consider this trade-off for your specific use case.

