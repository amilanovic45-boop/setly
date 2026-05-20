import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { deleteGeneration, generateImage, generateVideo, getGenerations, pollJobStatus } from '../api/higgsfield';
import type { ImageGenerationParams, VideoGenerationParams } from '../../types';

export function useGenerations() {
  const { setGenerations } = useAppStore();

  return useQuery({
    queryKey: ['generations'],
    queryFn: async () => {
      const gens = await getGenerations();
      setGenerations(gens);
      return gens;
    },
    staleTime: 30_000,
    retry: 2,
  });
}

export function useGenerateImage() {
  const { addGeneration, updateGeneration } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ImageGenerationParams) => {
      const generation = await generateImage(params);
      addGeneration(generation);

      if (generation.status === 'pending' || generation.status === 'processing') {
        const jobId = generation.jobId ?? generation.id;
        const completed = await pollJobStatus(jobId);
        updateGeneration(generation.id, {
          status: completed.status,
          mediaUrls: completed.mediaUrls,
          completedAt: completed.completedAt,
          errorMessage: completed.errorMessage,
        });
        return { ...generation, ...completed };
      }

      return generation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
    },
  });
}

export function useGenerateVideo() {
  const { addGeneration, updateGeneration } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: VideoGenerationParams) => {
      const generation = await generateVideo(params);
      addGeneration(generation);

      const jobId = generation.jobId ?? generation.id;
      const completed = await pollJobStatus(jobId);
      updateGeneration(generation.id, {
        status: completed.status,
        mediaUrls: completed.mediaUrls,
        completedAt: completed.completedAt,
        errorMessage: completed.errorMessage,
      });
      return { ...generation, ...completed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
    },
  });
}

export function useDeleteGeneration() {
  const { removeGeneration } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteGeneration(id);
      removeGeneration(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generations'] });
    },
  });
}
