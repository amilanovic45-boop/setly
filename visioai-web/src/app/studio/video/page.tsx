'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useGenerateVideo } from '@/lib/hooks';
import { uploadMedia } from '@/lib/api';
import { VIDEO_MODELS } from '@/constants/models';
import ModelCard from '@/components/ui/ModelCard';
import PromptInput from '@/components/ui/PromptInput';
import ProgressRing from '@/components/ui/ProgressRing';
import type { AspectRatio, VideoModel, Generation } from '@/types';

const RATIOS: AspectRatio[] = ['16:9', '9:16', '1:1'];
const DURATIONS = [3, 5, 8, 10];

function FramePicker({ label, preview, uploading, onDrop }: {
  label: string; preview: string | null; uploading: boolean;
  onDrop: (files: File[]) => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1, disabled: uploading,
  });
  return (
    <div>
      <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary mb-2">{label}</p>
      {preview ? (
        <div className="relative h-24 rounded-xl overflow-hidden border border-border">
          <Image src={preview} alt={label} fill className="object-cover" unoptimized />
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-white">
              Uploading…
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-xl mb-0.5">🖼</p>
          <p className="text-xs text-text-muted">Drop image or click</p>
        </div>
      )}
    </div>
  );
}

export default function VideoStudioPage() {
  const { mutateAsync: generate, isPending } = useGenerateVideo();

  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<VideoModel>('seedance_2_0');
  const [ratio, setRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState(5);
  const [startPreview, setStartPreview] = useState<string | null>(null);
  const [startUrl, setStartUrl] = useState<string | null>(null);
  const [endPreview, setEndPreview] = useState<string | null>(null);
  const [endUrl, setEndUrl] = useState<string | null>(null);
  const [uploadingStart, setUploadingStart] = useState(false);
  const [uploadingEnd, setUploadingEnd] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Generation | null>(null);
  const [looping, setLooping] = useState(true);

  const selectedModel = VIDEO_MODELS.find((m) => m.id === model);

  const makeDropHandler = (
    setPreview: (v: string | null) => void,
    setUrl: (v: string | null) => void,
    setUploading: (v: boolean) => void,
  ) => async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const up = await uploadMedia(file);
      setUrl(up.url);
    } catch {
      setPreview(null);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Enter a prompt'); return; }
    setProgress(0);
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(elapsed / (5 * 60_000), 0.92));
    }, 3000);
    try {
      const gen = await generate({
        prompt: prompt.trim(),
        model,
        aspectRatio: ratio,
        duration,
        startFrameUrl: startUrl ?? undefined,
        endFrameUrl: endUrl ?? undefined,
      });
      clearInterval(progressInterval);
      setResult(gen);
      setProgress(1);
      toast.success('Video ready!');
    } catch (e) {
      clearInterval(progressInterval);
      toast.error(e instanceof Error ? e.message : 'Generation failed');
      setProgress(0);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Controls */}
      <div className="w-full md:w-96 shrink-0 border-b md:border-b-0 md:border-r border-border overflow-y-auto p-5 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">🎬 Video Studio</h1>
          <p className="text-sm text-text-secondary mt-1">Generate cinematic videos from text</p>
        </div>

        <PromptInput
          value={prompt}
          onChange={setPrompt}
          placeholder="A slow dolly shot through a neon-lit Tokyo alley at night, rain on the pavement…"
          minHeight={140}
        />

        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary mb-3">Model</p>
          <div className="grid grid-cols-1 gap-2">
            {VIDEO_MODELS.map((m) => (
              <ModelCard key={m.id} model={m} selected={model === m.id} onSelect={(mm) => setModel(mm.id as VideoModel)} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary mb-2">Ratio</p>
            <div className="flex flex-col gap-1.5">
              {RATIOS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all text-left ${
                    ratio === r ? 'border-accent bg-accent/15 text-accent' : 'border-border bg-card text-text-secondary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary mb-2">Duration</p>
            <div className="flex flex-col gap-1.5">
              {DURATIONS.filter((d) => d <= (selectedModel?.maxDuration ?? 10)).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all text-left ${
                    duration === d ? 'border-accent bg-accent/15 text-accent' : 'border-border bg-card text-text-secondary'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
        </div>

        <FramePicker
          label="Start Frame (optional)"
          preview={startPreview}
          uploading={uploadingStart}
          onDrop={makeDropHandler(setStartPreview, setStartUrl, setUploadingStart)}
        />
        {selectedModel?.supportsEndFrame && (
          <FramePicker
            label="End Frame (optional)"
            preview={endPreview}
            uploading={uploadingEnd}
            onDrop={makeDropHandler(setEndPreview, setEndUrl, setUploadingEnd)}
          />
        )}

        <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 text-xs text-warning flex gap-2">
          <span>⏱</span>
          Video generation takes 1–5 minutes. You can leave this page and come back.
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isPending}
          className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-accent to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow hover:shadow-glow-accent text-sm"
        >
          {isPending ? '⏳ Generating video…' : '✦ Generate Video'}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-5 flex items-center justify-center">
        {isPending ? (
          <div className="text-center space-y-6">
            <ProgressRing progress={progress * 100} size={80} indeterminate={progress === 0} />
            <div>
              <p className="text-lg font-bold text-text-primary">Creating your video</p>
              <p className="text-sm text-text-secondary mt-1">This usually takes 1–5 minutes</p>
            </div>
            {progress > 0 && (
              <div className="w-64 bg-card rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ) : result?.mediaUrls[0] ? (
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">Video ready ✓</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLooping(!looping)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    looping ? 'border-accent/40 bg-accent/15 text-accent' : 'border-border text-text-secondary'
                  }`}
                >
                  ∞ Loop {looping ? 'on' : 'off'}
                </button>
                <a
                  href={result.mediaUrls[0]}
                  download={`visioai-${result.id}.mp4`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors"
                >
                  ⬇ Download
                </a>
                <Link
                  href={`/generation/${result.id}`}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors"
                >
                  Details →
                </Link>
              </div>
            </div>
            <video
              src={result.mediaUrls[0]}
              controls
              loop={looping}
              autoPlay
              className="w-full rounded-2xl border border-border"
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-card border border-border flex items-center justify-center text-3xl mb-4">
              🎬
            </div>
            <p className="text-text-secondary">Your video will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
