import * as SecureStore from 'expo-secure-store';
import type {
  Balance,
  Generation,
  GenerationType,
  ImageGenerationParams,
  UploadedMedia,
  VideoGenerationParams,
} from '../../types';

const BASE_URL = 'https://api.higgsfield.ai';
const SECURE_KEY = 'higgsfield_api_key';
const POLL_INTERVAL = 3000;
const POLL_TIMEOUT = 5 * 60 * 1000;
const MAX_RETRIES = 3;

export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEY, key);
}

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_KEY);
}

export async function clearApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_KEY);
}

async function getHeaders(): Promise<Record<string, string>> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new ApiError('No API key configured', 401);
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 0,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  let lastError: Error = new Error('Unknown error');
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 || response.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, delay));
        lastError = new ApiError(`Server error: ${response.status}`, response.status);
        continue;
      }
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }
  throw lastError;
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers = await getHeaders();
  const response = await fetchWithRetry(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (data as { error?: string; message?: string }).error
      ?? (data as { error?: string; message?: string }).message
      ?? `Request failed: ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export async function checkBalance(): Promise<Balance> {
  try {
    const data = await apiRequest<{ credits: number; plan: string; renewal_date?: string }>(
      'GET',
      '/v1/balance',
    );
    return {
      credits: data.credits,
      plan: data.plan,
      renewalDate: data.renewal_date,
    };
  } catch {
    return { credits: 0, plan: 'free' };
  }
}

export async function generateImage(params: ImageGenerationParams): Promise<Generation> {
  const payload = {
    prompt: params.prompt,
    model: params.model,
    aspect_ratio: params.aspectRatio,
    num_images: params.numImages ?? 1,
    ...(params.referenceImageUrl && { reference_image_url: params.referenceImageUrl }),
    ...(params.styleStrength !== undefined && { style_strength: params.styleStrength }),
  };

  const data = await apiRequest<{
    id: string;
    status: string;
    media_urls?: string[];
    job_id?: string;
  }>('POST', '/v1/generate/image', payload);

  return {
    id: data.id,
    type: 'image',
    prompt: params.prompt,
    model: params.model,
    aspectRatio: params.aspectRatio,
    status: mapStatus(data.status),
    mediaUrls: data.media_urls ?? [],
    createdAt: new Date().toISOString(),
    jobId: data.job_id,
  };
}

export async function generateVideo(params: VideoGenerationParams): Promise<Generation> {
  const payload = {
    prompt: params.prompt,
    model: params.model,
    aspect_ratio: params.aspectRatio,
    ...(params.duration && { duration: params.duration }),
    ...(params.startFrameUrl && { start_frame_url: params.startFrameUrl }),
    ...(params.endFrameUrl && { end_frame_url: params.endFrameUrl }),
  };

  const data = await apiRequest<{
    id: string;
    status: string;
    job_id?: string;
  }>('POST', '/v1/generate/video', payload);

  return {
    id: data.id,
    type: 'video',
    prompt: params.prompt,
    model: params.model,
    aspectRatio: params.aspectRatio,
    status: mapStatus(data.status),
    mediaUrls: [],
    createdAt: new Date().toISOString(),
    jobId: data.job_id ?? data.id,
  };
}

export async function pollJobStatus(jobId: string): Promise<Generation> {
  const startTime = Date.now();

  while (Date.now() - startTime < POLL_TIMEOUT) {
    const data = await apiRequest<{
      id: string;
      status: string;
      media_urls?: string[];
      error?: string;
      type?: string;
      prompt?: string;
      model?: string;
      aspect_ratio?: string;
      created_at?: string;
    }>('GET', `/v1/jobs/${jobId}`);

    if (data.status === 'completed' || data.status === 'failed') {
      return {
        id: data.id,
        type: (data.type as 'image' | 'video') ?? 'video',
        prompt: data.prompt ?? '',
        model: (data.model as Generation['model']) ?? 'seedance_2_0',
        aspectRatio: (data.aspect_ratio as Generation['aspectRatio']) ?? '16:9',
        status: mapStatus(data.status),
        mediaUrls: data.media_urls ?? [],
        createdAt: data.created_at ?? new Date().toISOString(),
        completedAt: new Date().toISOString(),
        errorMessage: data.error,
        jobId,
      };
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL));
  }

  throw new ApiError('Generation timed out after 5 minutes', 408, 'TIMEOUT');
}

export async function getGenerations(page = 1, limit = 20): Promise<Generation[]> {
  const data = await apiRequest<{
    items: Array<{
      id: string;
      type: string;
      status: string;
      prompt: string;
      model: string;
      aspect_ratio: string;
      media_urls: string[];
      thumbnail_url?: string;
      created_at: string;
      completed_at?: string;
    }>;
  }>('GET', `/v1/generations?page=${page}&limit=${limit}`);

  return (data.items ?? []).map(item => ({
    id: item.id,
    type: item.type as GenerationType,
    prompt: item.prompt,
    model: item.model as Generation['model'],
    aspectRatio: item.aspect_ratio as Generation['aspectRatio'],
    status: mapStatus(item.status),
    mediaUrls: item.media_urls ?? [],
    thumbnailUrl: item.thumbnail_url,
    createdAt: item.created_at,
    completedAt: item.completed_at,
  }));
}

export async function deleteGeneration(id: string): Promise<void> {
  await apiRequest<void>('DELETE', `/v1/generations/${id}`);
}

export async function uploadMedia(
  fileUri: string,
  mimeType: string,
): Promise<UploadedMedia> {
  const headers = await getHeaders();
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: mimeType,
    name: 'upload.' + mimeType.split('/')[1],
  } as unknown as Blob);

  const uploadHeaders = { ...headers };
  delete uploadHeaders['Content-Type'];

  const response = await fetchWithRetry(`${BASE_URL}/v1/media/upload`, {
    method: 'POST',
    headers: uploadHeaders,
    body: formData,
  });

  const data = await response.json().catch(() => ({})) as { url?: string; asset_id?: string };
  if (!response.ok) {
    throw new ApiError('Upload failed', response.status);
  }

  return {
    url: data.url ?? '',
    assetId: data.asset_id ?? '',
  };
}

function mapStatus(status: string): Generation['status'] {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'succeeded':
      return 'completed';
    case 'failed':
    case 'error':
      return 'failed';
    case 'processing':
    case 'running':
    case 'in_progress':
      return 'processing';
    default:
      return 'pending';
  }
}

