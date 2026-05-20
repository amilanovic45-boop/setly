'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useGenerateImage } from '@/lib/hooks';
import { uploadMedia } from '@/lib/api';
import { IMAGE_MODELS } from '@/constants/models';
import ModelCard from '@/components/ui/ModelCard';
import PromptInput from '@/components/ui/PromptInput';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import type { AspectRatio, ImageModel, Generation } from '@/types';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '9:16', '16:9', '3:4', '4:3'];

export default function ImageStudioPage() {
  const { mutateAsync: generate, isPending } = useGenerateImage();

  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ImageModel>('soul_2');
  const [ratio, setRatio] = useState<AspectRatio>('1:1');
  const [numImages, setNumImages] = useState(1);
  const [refUrl, setRefUrl] = useState<string | null>(null);
  const [refPreview, setRefPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<Generation | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setRefPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const up = await uploadMedia(file);
      setRefUrl(up.url);
      toast.success('Reference image uploaded');
    } catch {
      setRefPreview(null);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Enter a prompt'); return; }
    try {
      const gen = await generate({ prompt: prompt.trim(), model, aspectRatio: ratio, numImages, referenceImageUrl: refUrl ?? undefined });
      setResult(gen);
      setActiveImg(0);
      toast.success('Generation complete!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed');
    }
  };

  const handleDownload = async (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `visioai-${Date.now()}.jpg`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Controls */}
      <div className="w-full md:w-96 shrink-0 border-b md:border-b-0 md:border-r border-border overflow-y-auto p-5 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">🎨 Image Studio</h1>
          <p className="text-sm text-text-secondary mt-1">Generate images from text prompts</p>
        </div>

        <PromptInput
          value={prompt}
          onChange={setPrompt}
          placeholder="A cinematic portrait of a woman in golden hour light, shallow depth of field..."
        />

        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary mb-3">Model</p>
          <div className="grid grid-cols-1 gap-2">
            {IMAGE_MODELS.map((m) => (
              <ModelCard key={m.id} model={m} selected={model === m.id} onSelect={(mm) => setModel(mm.id as ImageModel)} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary mb-3">Aspect Ratio</p>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r}
                onClick={() => setRatio(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                  ratio === r
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-card text-text-secondary hover:text-text-primary'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-text-secondary hover:text-text-primary font-medium transition-colors"
          >
            {showAdvanced ? '▼' : '▶'} Advanced settings
          </button>
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3 space-y-4"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary mb-2">
                    Number of images
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNumImages(n)}
                        className={`w-12 h-12 rounded-xl font-bold text-lg border transition-all ${
                          numImages === n
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border bg-card text-text-secondary'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary mb-2">
                    Reference image
                  </p>
                  {refPreview ? (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-border">
                      <Image src={refPreview} alt="ref" fill className="object-cover" unoptimized />
                      <button
                        onClick={() => { setRefPreview(null); setRefUrl(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 rounded-lg text-white text-sm hover:bg-red-500"
                      >
                        ✕
                      </button>
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs text-white">
                          Uploading…
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <p className="text-2xl mb-1">📎</p>
                      <p className="text-sm text-text-secondary">Drop image or click to browse</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isPending}
          className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow hover:shadow-glow-primary glow-pulse text-sm"
        >
          {isPending ? '⏳ Generating…' : `✦ Generate${numImages > 1 ? ` ${numImages} Images` : ''}`}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-5">
        {isPending ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: numImages }).map((_, i) => (
              <SkeletonLoader key={i} height={300} className="rounded-2xl" />
            ))}
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">
                {result.mediaUrls.length} image{result.mediaUrls.length > 1 ? 's' : ''} generated
              </p>
              <Link href={`/generation/${result.id}`} className="text-xs text-primary hover:underline">
                View details →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {result.mediaUrls.map((url, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative rounded-2xl overflow-hidden group border border-border"
                >
                  <Image
                    src={url}
                    alt={`result ${i + 1}`}
                    width={600}
                    height={600}
                    className="w-full h-auto"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDownload(url)}
                      className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm font-semibold"
                    >
                      ⬇ Download
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-3xl mb-4">
              🎨
            </div>
            <p className="text-text-secondary">Your images will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
