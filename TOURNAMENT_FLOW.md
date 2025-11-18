# Tournament Flow - How It Works

## 🎮 **Complete Tournament Flow**

### **User Journey:**

1. **User Opens Tournament Page**
   - Sees two tournament options: Public ($50) and NFT ($200)
   - Can switch between tabs to see details of each

2. **User Clicks "Enter Tournament" Button**
   - System validates eligibility (NFT check for NFT tournament)
   - Stores tournament entry in database
   - **Immediately starts the game** with tournament mode active
   - Game shows tournament indicator at top

3. **User Plays Game**
   - Tournament badge visible during gameplay
   - User can see which tournament they're playing in

4. **Game Ends**
   - Score is **automatically saved** with tournament type
   - Database stores:
     - `publicTournamentScore` (if public tournament)
     - `nftTournamentScore` (if NFT tournament)
     - `hasNFT` status
   - Game over screen shows tournament confirmation

5. **Leaderboard Updates**
   - Score appears on correct tournament leaderboard
   - Public tournament: Shows all players
   - NFT tournament: Shows ONLY NFT holders

---

## 🔧 **Technical Implementation**

### **State Management (app.tsx):**
```typescript
const [activeTournament, setActiveTournament] = useState<TournamentType>('none')

// When entering tournament:
handleStartTournament(tournamentType) → Sets active tournament → Starts game
```

### **Tournament Entry (Tournament.tsx):**
```typescript
handleEnterTournament() {
  1. Validate user eligibility
  2. Call POST /api/tournament/{type}
  3. If successful:
     - Mark as entered
     - Save to localStorage
     - Call onStartTournament(type) → Starts game immediately
}
```

### **Game Score Saving (ApexRunnerGame.tsx):**
```typescript
saveScoreToDatabase({
  ...scoreData,
  tournamentType: tournamentType,  // 'public', 'nft', or 'none'
  hasNFT: hasNFT || false,         // User's NFT status
})
```

### **API Score Saving (save-score/route.ts):**
```typescript
{
  publicTournamentScore: tournamentType === "public" ? score : 0,
  nftTournamentScore: tournamentType === "nft" ? score : 0,
  hasNFT: boolean
}
```

### **Leaderboard Queries:**
```typescript
// Public Tournament
getPublicTournamentLeaderboard()
→ Filter: publicTournamentScore > 0

// NFT Tournament
getNFTTournamentLeaderboard()
→ Filter: hasNFT = true AND nftTournamentScore > 0
```

---

## ✅ **What Was Fixed:**

### **Before:**
- ❌ "Enter Tournament" button did nothing
- ❌ Users had to manually go back and play game
- ❌ No tournament tracking
- ❌ Scores not saved to tournament
- ❌ Same leaderboard for both tournaments

### **After:**
- ✅ "Enter Tournament" → **Immediately starts game**
- ✅ Tournament mode tracked throughout gameplay
- ✅ Scores **automatically saved** to correct tournament
- ✅ Separate leaderboards with proper filtering
- ✅ Visual tournament indicators during gameplay
- ✅ Confirmation message on game over

---

## 📊 **Data Flow:**

```
User Clicks "Enter Tournament"
    ↓
POST /api/tournament/{type}
    ↓
Entry Validated & Stored
    ↓
Game Starts (with tournamentType prop)
    ↓
User Plays Game
    ↓
Game Ends → Score Saved
    ↓
POST /api/save-score {
  score,
  tournamentType: 'public' | 'nft',
  hasNFT: boolean
}
    ↓
Database Updates:
  - General score (always)
  - publicTournamentScore (if public)
  - nftTournamentScore (if NFT)
  - hasNFT status
    ↓
Leaderboard Shows Score:
  - Public leaderboard (if public tournament)
  - NFT leaderboard (if NFT tournament AND hasNFT)
```

---

## 🎯 **Key Features:**

1. **Auto-Game Start:** Clicking "Enter Tournament" immediately launches the game
2. **Tournament Tracking:** Game knows which tournament it's running
3. **Auto-Score Saving:** Scores automatically saved to correct tournament
4. **Filtered Leaderboards:** Each tournament shows only eligible players
5. **Visual Feedback:** Tournament badge shown during gameplay and game over
6. **Persistent Entry:** Tournament entry saved to localStorage

---

## 🧪 **Testing Steps:**

### Test Public Tournament:
1. Click "Enter Public Tournament"
2. Game should start immediately
3. Play game
4. Check public leaderboard - score should appear
5. Check NFT leaderboard - score should NOT appear

### Test NFT Tournament (without NFT):
1. Click "Enter NFT Tournament"
2. Should show "Buy NFT to Enter"
3. Cannot enter

### Test NFT Tournament (with NFT):
1. Connect wallet with NFT
2. Click "Enter NFT Tournament"
3. Game starts immediately
4. Play game
5. Check NFT leaderboard - score should appear
6. Check public leaderboard - score should NOT appear (unless also entered public)

---

## 🔒 **Security:**

- NFT verification done server-side
- Tournament type sent with score prevents manipulation
- hasNFT status verified and stored
- Leaderboard queries filter at database level
- No way to fake tournament participation

---

## 💾 **Database Schema:**

```typescript
GameScore {
  score: number                    // General score
  publicTournamentScore: number    // Public tournament score
  nftTournamentScore: number       // NFT tournament score
  hasNFT: boolean                  // NFT ownership status
  // ... other fields
}
```

Separate fields ensure:
- Independent tournament tracking
- Proper leaderboard filtering
- User can participate in both tournaments
- Scores don't mix between tournaments

