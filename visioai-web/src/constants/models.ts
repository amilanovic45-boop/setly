import type { ModelInfo } from '@/types';

export const IMAGE_MODELS: ModelInfo[] = [
  {
    id: 'soul_2',
    name: 'Soul 2',
    type: 'image',
    description: 'Cinematic, photorealistic imagery with stunning depth and atmosphere.',
    bestFor: 'Portraits, landscapes, cinematic shots',
    previewImages: [],
    aspectRatios: ['1:1', '9:16', '16:9', '3:4', '4:3'],
  },
  {
    id: 'nano_banana_pro',
    name: 'Nano Banana Pro',
    type: 'image',
    description: 'High-fidelity creative imagery with artistic flair and detail.',
    bestFor: 'Creative art, illustrations, stylized content',
    previewImages: [],
    aspectRatios: ['1:1', '9:16', '16:9', '3:4', '4:3'],
  },
  {
    id: 'ms_image',
    name: 'DTC Ads',
    type: 'image',
    description: 'Optimized for direct-to-consumer advertising and marketing visuals.',
    bestFor: 'Product shots, ads, marketing materials',
    previewImages: [],
    aspectRatios: ['1:1', '9:16', '16:9', '3:4', '4:3'],
  },
];

export const VIDEO_MODELS: ModelInfo[] = [
  {
    id: 'seedance_2_0',
    name: 'Seedance 2.0',
    type: 'video',
    description: 'Fluid, cinematic video generation with natural motion and storytelling.',
    bestFor: 'Cinematic clips, narrative content, smooth motion',
    previewImages: [],
    maxDuration: 10,
    supportsEndFrame: true,
    aspectRatios: ['9:16', '16:9', '1:1'],
  },
  {
    id: 'kling3_0',
    name: 'Kling 3.0',
    type: 'video',
    description: 'Ultra-realistic video with exceptional detail and character consistency.',
    bestFor: 'Character animations, realistic scenes, product videos',
    previewImages: [],
    maxDuration: 10,
    supportsEndFrame: false,
    aspectRatios: ['9:16', '16:9', '1:1'],
  },
  {
    id: 'marketing_studio_video',
    name: 'Marketing Studio',
    type: 'video',
    description: 'Professionally crafted video content optimized for social media and ads.',
    bestFor: 'Social media, ads, product showcases',
    previewImages: [],
    maxDuration: 15,
    supportsEndFrame: false,
    aspectRatios: ['9:16', '16:9', '1:1'],
  },
];

export const ASPECT_RATIO_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '9:16': { width: 576, height: 1024 },
  '16:9': { width: 1024, height: 576 },
  '3:4': { width: 768, height: 1024 },
  '4:3': { width: 1024, height: 768 },
};
