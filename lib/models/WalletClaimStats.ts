import mongoose, { Schema, model, models } from 'mongoose';

export interface IWalletClaimStats {
  walletAddress: string;
  fid?: number | null;
  claim: number; // Resets every 24 hours
  totalClaim: number; // Cumulative, never resets
  lastClaimTime: number; // Timestamp of last claim
  lastResetTime: number; // Timestamp when claim was last reset
  createdAt?: Date;
  updatedAt?: Date;
}

const WalletClaimStatsSchema = new Schema<IWalletClaimStats>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    fid: {
      type: Number,
      default: null,
      index: true,
    },
    claim: {
      type: Number,
      default: 0,
      required: true,
    },
    totalClaim: {
      type: Number,
      default: 0,
      required: true,
    },
    lastClaimTime: {
      type: Number,
      default: 0,
      index: true,
    },
    lastResetTime: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
WalletClaimStatsSchema.index({ walletAddress: 1, lastClaimTime: -1 });

const WalletClaimStats = models.WalletClaimStats || model<IWalletClaimStats>('WalletClaimStats', WalletClaimStatsSchema);

export default WalletClaimStats;

