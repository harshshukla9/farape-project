import mongoose, { Schema, model, models } from 'mongoose';

export interface IRewardClaim {
  walletAddress: string;
  fid: number | null;
  tokenAddress: string;
  amount: string;
  amountInWei: string;
  nonce: string;
  signature: string;
  timestamp: number;
  claimed: boolean;
  claimedAt?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const RewardClaimSchema = new Schema<IRewardClaim>(
  {
    walletAddress: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    fid: {
      type: Number,
      default: null,
      index: true,
    },
    tokenAddress: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    amountInWei: {
      type: String,
      required: true,
    },
    nonce: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    signature: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
      index: true,
    },
    claimed: {
      type: Boolean,
      default: false,
      index: true,
    },
    claimedAt: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
RewardClaimSchema.index({ walletAddress: 1, timestamp: -1 });
RewardClaimSchema.index({ fid: 1, timestamp: -1 });

const RewardClaim = models.RewardClaim || model<IRewardClaim>('RewardClaim', RewardClaimSchema);

export default RewardClaim;

