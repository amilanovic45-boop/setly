export type GenerationType = 'image' | 'video';

export type AspectRatio = '1:1' | '9:16' | '16:9' | '3:4' | '4:3';

export type ImageModel = 'soul_2' | 'nano_banana_pro' | 'ms_image';
export type VideoModel = 'seedance_2_0' | 'kling3_0' | 'marketing_studio_video';
export type AnyModel = ImageModel | VideoModel;

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Generation {
  id: string;
  type: GenerationType;
  prompt: string;
  model: AnyModel;
  aspectRatio: AspectRatio;
  status: GenerationStatus;
  mediaUrls: string[];
  thumbnailUrl?: string;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  jobId?: string;
  metadata?: Record<string, unknown>;
}

export interface ImageGenerationParams {
  prompt: string;
  model: ImageModel;
  aspectRatio: AspectRatio;
  numImages?: number;
  referenceImageUrl?: string;
  styleStrength?: number;
}

export interface VideoGenerationParams {
  prompt: string;
  model: VideoModel;
  aspectRatio: AspectRatio;
  duration?: number;
  startFrameUrl?: string;
  endFrameUrl?: string;
}

export interface Balance {
  credits: number;
  plan: string;
  renewalDate?: string;
}

export interface ModelInfo {
  id: AnyModel;
  name: string;
  type: GenerationType;
  description: string;
  bestFor: string;
  previewImages: string[];
  maxDuration?: number;
  supportsEndFrame?: boolean;
  aspectRatios: AspectRatio[];
}

export interface AppSettings {
  defaultImageModel: ImageModel;
  defaultVideoModel: VideoModel;
  defaultAspectRatio: AspectRatio;
  theme: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
}

export interface UploadedMedia {
  url: string;
  assetId: string;
}
