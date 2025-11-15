import mongoose, { Schema, model, models } from 'mongoose';

export interface IGameScore {
  walletAddress: string;
  fid: number;
  pfpUrl: string | null;
  displayName: string | null;
  username: string | null;
  score: number;
  timestamp: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const GameScoreSchema = new Schema<IGameScore>(
  {
    walletAddress: {
      type: String,
      required: true,
      index: true,
    },
    fid: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    pfpUrl: {
      type: String,
      default: null,
    },
    displayName: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      required: true,
      index: true,
    },
    timestamp: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
GameScoreSchema.index({ fid: 1, score: -1 });
GameScoreSchema.index({ score: -1, timestamp: -1 });
GameScoreSchema.index({ walletAddress: 1, score: -1 });

const GameScore = models.GameScore || model<IGameScore>('GameScore', GameScoreSchema);

export default GameScore;

