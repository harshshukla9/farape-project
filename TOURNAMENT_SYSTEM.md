# Tournament System Documentation

## Overview
The game now has **two separate tournaments** with their own leaderboards and prize pools:

### 1. 🌍 Public Tournament
- **Prize Pool:** $50
- **Eligibility:** Anyone can play
- **Leaderboard:** Shows all players who entered the public tournament

### 2. 🦍 NFT Holders Tournament  
- **Prize Pool:** $200 (4x higher!)
- **Eligibility:** NFT holders only
- **Leaderboard:** Shows **ONLY** NFT holders who entered this tournament

---

## How It Works

### Database Changes

**New Fields in GameScore Model:**
```typescript
{
  hasNFT: boolean              // Tracks if user owns an NFT
  publicTournamentScore: number // User's score in public tournament
  nftTournamentScore: number    // User's score in NFT tournament (only if hasNFT = true)
}
```

### Separate Leaderboards

Each tournament has its own leaderboard that **filters by tournament type**:

- **Public Tournament**: Shows players where `publicTournamentScore > 0`
- **NFT Tournament**: Shows players where `hasNFT = true AND nftTournamentScore > 0`

This ensures:
- ✅ Non-NFT holders cannot appear in NFT tournament leaderboard
- ✅ Each tournament tracks scores independently
- ✅ Players can participate in both tournaments separately

---

## API Endpoints

### Public Tournament
```
GET  /api/tournament/public    → Get public leaderboard
POST /api/tournament/public    → Enter public tournament
```

### NFT Tournament
```
GET  /api/tournament/nft       → Get NFT holders leaderboard (filtered)
POST /api/tournament/nft       → Enter NFT tournament (requires hasNFT = true)
```

### Save Score
```
POST /api/save-score
Body: {
  ...existing fields,
  tournamentType: "public" | "nft" | "none",  // Which tournament score to update
  hasNFT: boolean                              // Whether user owns NFT
}
```

---

## User Flow

### For Public Tournament:
1. User clicks "Enter Public Tournament"
2. System records tournament entry
3. User plays game
4. Score is saved with `tournamentType: "public"`
5. Score appears in **Public Tournament leaderboard only**

### For NFT Tournament:
1. User clicks "Enter NFT Tournament"
2. System checks if user has NFT (via Alchemy API)
3. If NO NFT → Show "Buy NFT to Enter" button
4. If HAS NFT:
   - Mark user as NFT holder in database (`hasNFT = true`)
   - Allow tournament entry
   - User plays game
   - Score saved with `tournamentType: "nft"` and `hasNFT: true`
   - Score appears in **NFT Tournament leaderboard only**

---

## Frontend Implementation

**Tournament.tsx** component handles:
- Tab switching between tournaments
- NFT verification for NFT tournament
- Tournament entry
- Real-time leaderboards for each tournament
- Entry status tracking

**Key Features:**
- Tab-based UI to switch tournaments
- Automatic NFT verification
- Separate "Enter Tournament" buttons
- Visual confirmation of eligibility
- Real-time leaderboard updates

---

## Prize Distribution

### Public Tournament ($50)
- 1st: $20
- 2nd: $15  
- 3rd: $10
- 4th-10th: $5 each

### NFT Tournament ($200)
- 1st: $80
- 2nd: $50
- 3rd: $30
- 4th: $20
- 5th-10th: $10 each

---

## Important Notes

1. **Separate Scoring**: Each tournament has its own score field
2. **NFT Verification**: Only verified NFT holders can enter NFT tournament
3. **Filtered Leaderboards**: NFT tournament ONLY shows NFT holders
4. **Independent Participation**: Users can enter both tournaments
5. **Score Tracking**: System tracks which tournament each score belongs to

## Testing

To test the system:

1. **Test Public Tournament:**
   - Enter public tournament (no NFT needed)
   - Play game and save score
   - Check public leaderboard - your score should appear

2. **Test NFT Tournament (without NFT):**
   - Try to enter NFT tournament
   - Should see "Buy NFT to Enter" button
   - Cannot enter or appear on NFT leaderboard

3. **Test NFT Tournament (with NFT):**
   - Connect wallet with NFT
   - Enter NFT tournament
   - Play game and save score
   - Check NFT leaderboard - your score should appear
   - Check public leaderboard - score should NOT appear there (unless you also entered public)

---

## Migration Notes

Existing users in the database will have:
- `hasNFT: false` (default)
- `publicTournamentScore: 0`
- `nftTournamentScore: 0`

They need to **enter a tournament** before their scores will appear on that tournament's leaderboard.

