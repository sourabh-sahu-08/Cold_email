import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  fullName: string;
  professionalTitle: string;
  resumeUrl: string;
  portfolioUrl: string;
  linkedInUrl: string;
  gitHubUrl: string;
  contactEmail: string;
  skillsSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    fullName: {
      type: String,
      required: true,
      default: 'Sourabh Sahu',
      trim: true,
    },
    professionalTitle: {
      type: String,
      required: true,
      default: 'Full Stack Developer',
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: '',
      trim: true,
    },
    portfolioUrl: {
      type: String,
      default: '',
      trim: true,
    },
    linkedInUrl: {
      type: String,
      default: '',
      trim: true,
    },
    gitHubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true,
    },
    skillsSummary: {
      type: String,
      default: 'Proficient in React, Node.js, TypeScript, Next.js, REST APIs, and modern cloud technologies.',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);
