import { Schema, model, models } from 'mongoose'

export interface INftTournamentScore {
  fid: number
  walletAddress: string
  username: string | null
  displayName: string | null
  pfpUrl: string | null
  score: number
  lastUpdatedAt: number
  createdAt?: Date
  updatedAt?: Date
}

const NftTournamentScoreSchema = new Schema<INftTournamentScore>(
  {
    fid: { type: Number, required: true, unique: true, index: true },
    walletAddress: { type: String, required: true, index: true },
    username: { type: String, default: null },
    displayName: { type: String, default: null },
    pfpUrl: { type: String, default: null },
    score: { type: Number, required: true, default: 0, index: true },
    lastUpdatedAt: { type: Number, required: true },
  },
  { timestamps: true }
)

NftTournamentScoreSchema.index({ score: -1, lastUpdatedAt: -1 })

const NftTournamentScore =
  models.NftTournamentScore ||
  model<INftTournamentScore>('NftTournamentScore', NftTournamentScoreSchema)

export default NftTournamentScore


