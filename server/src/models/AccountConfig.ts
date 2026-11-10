import mongoose, { Document, Schema } from 'mongoose';

export interface IAccountConfig extends Document {
  key: string; // e.g. "default"
  gmailTokens?: {
    accessToken?: string;
    refreshToken?: string;
    expiryDate?: number;
    tokenType?: string;
    scope?: string;
  };
  connectedAccount?: {
    email?: string;
    name?: string;
    picture?: string;
    connectedAt?: Date;
  };
  geminiApiKey?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  dailySendLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const AccountConfigSchema = new Schema<IAccountConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'primary',
    },
    gmailTokens: {
      accessToken: { type: String, default: '' },
      refreshToken: { type: String, default: '' },
      expiryDate: { type: Number, default: 0 },
      tokenType: { type: String, default: '' },
      scope: { type: String, default: '' },
    },
    connectedAccount: {
      email: { type: String, default: '' },
      name: { type: String, default: '' },
      picture: { type: String, default: '' },
      connectedAt: { type: Date },
    },
    geminiApiKey: {
      type: String,
      default: '',
    },
    googleClientId: {
      type: String,
      default: '',
    },
    googleClientSecret: {
      type: String,
      default: '',
    },
    dailySendLimit: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

export const AccountConfig = mongoose.model<IAccountConfig>('AccountConfig', AccountConfigSchema);
