import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { useGenerateVideo } from '../../lib/hooks/useGenerations';
import { useAppStore } from '../../lib/store';
import { uploadMedia } from '../../lib/api/higgsfield';
import { Colors } from '../../constants/colors';
import { GradientButton } from '../../components/ui/GradientButton';
import { ModelCard } from '../../components/ui/ModelCard';
import { PromptInput } from '../../components/ui/PromptInput';
import { AspectRatioPicker } from '../../components/shared/AspectRatioPicker';
import { VIDEO_MODELS } from '../../constants/models';
import type { AspectRatio, VideoModel } from '../../types';

export default function VideoStudioScreen() {
  const { settings } = useAppStore();
  const { mutateAsync: generate, isPending } = useGenerateVideo();

  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<VideoModel>(settings.defaultVideoModel);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState(5);

  const [startFrameUri, setStartFrameUri] = useState<string | null>(null);
  const [startFrameUrl, setStartFrameUrl] = useState<string | null>(null);
  const [endFrameUri, setEndFrameUri] = useState<string | null>(null);
  const [endFrameUrl, setEndFrameUrl] = useState<string | null>(null);
  const [uploadingStart, setUploadingStart] = useState(false);
  const [uploadingEnd, setUploadingEnd] = useState(false);

  const selectedModelInfo = VIDEO_MODELS.find(m => m.id === selectedModel);
  const maxDuration = selectedModelInfo?.maxDuration ?? 10;
  const supportsEndFrame = selectedModelInfo?.supportsEndFrame ?? false;

  const pickFrame = async (
    setUri: (v: string | null) => void,
    setUrl: (v: string | null) => void,
    setUploading: (v: boolean) => void,
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUri(asset.uri);
      setUploading(true);
      try {
        const uploaded = await uploadMedia(asset.uri, asset.mimeType ?? 'image/jpeg');
        setUrl(uploaded.url);
        Toast.show({ type: 'success', text1: 'Frame uploaded' });
      } catch {
        setUri(null);
        Toast.show({ type: 'error', text1: 'Upload failed' });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a prompt' });
      return;
    }

    router.push('/generation/queue');

    try {
      const generation = await generate({
        prompt: prompt.trim(),
        model: selectedModel,
        aspectRatio,
        duration,
        startFrameUrl: startFrameUrl ?? undefined,
        endFrameUrl: endFrameUrl ?? undefined,
      });

      router.replace(`/generation/${generation.id}`);
    } catch (err) {
      router.back();
      const message = err instanceof Error ? err.message : 'Generation failed';
      Toast.show({ type: 'error', text1: 'Generation failed', text2: message });
    }
  };

  const FramePicker = ({
    label,
    uri,
    uploading,
    onPick,
    onRemove,
  }: {
    label: string;
    uri: string | null;
    uploading: boolean;
    onPick: () => void;
    onRemove: () => void;
  }) => (
    <View>
      <Text style={styles.sectionLabel}>{label}</Text>
      {uri ? (
        <View style={styles.frameContainer}>
          <Image source={{ uri }} style={styles.frameImage} contentFit="cover" />
          <View style={styles.frameOverlay}>
            {uploading && <Text style={styles.uploadingText}>Uploading...</Text>}
            <Pressable onPress={onRemove} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable onPress={onPick} style={styles.uploadArea}>
          <Text style={styles.uploadIcon}>🖼</Text>
          <Text style={styles.uploadText}>{label}</Text>
          <Text style={styles.uploadSubtext}>Tap to select from photos</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>Video Studio</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <PromptInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="A slow cinematic dolly shot through a neon-lit Tokyo alley at night, rain on the pavement..."
            minHeight={160}
          />

          <View>
            <Text style={styles.sectionLabel}>Model</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.modelRow}>
                {VIDEO_MODELS.map(model => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    selected={selectedModel === model.id}
                    onSelect={(m) => setSelectedModel(m.id as VideoModel)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          <AspectRatioPicker
            selected={aspectRatio}
            options={selectedModelInfo?.aspectRatios ?? ['9:16', '16:9', '1:1']}
            onChange={setAspectRatio}
          />

          <View>
            <Text style={styles.sectionLabel}>
              Duration: <Text style={styles.durationValue}>{duration}s</Text>
            </Text>
            <View style={styles.durationRow}>
              {[3, 5, 8, 10, ...(maxDuration > 10 ? [15] : [])].filter(d => d <= maxDuration).map(d => (
                <Pressable
                  key={d}
                  onPress={() => setDuration(d)}
                  style={[styles.durationBtn, duration === d && styles.durationBtnActive]}
                >
                  <Text style={[styles.durationBtnText, duration === d && styles.durationBtnTextActive]}>
                    {d}s
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <FramePicker
            label="Start Frame (Optional)"
            uri={startFrameUri}
            uploading={uploadingStart}
            onPick={() => pickFrame(setStartFrameUri, setStartFrameUrl, setUploadingStart)}
            onRemove={() => { setStartFrameUri(null); setStartFrameUrl(null); }}
          />

          {supportsEndFrame && (
            <FramePicker
              label="End Frame (Optional)"
              uri={endFrameUri}
              uploading={uploadingEnd}
              onPick={() => pickFrame(setEndFrameUri, setEndFrameUrl, setUploadingEnd)}
              onRemove={() => { setEndFrameUri(null); setEndFrameUrl(null); }}
            />
          )}

          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⏱</Text>
            <Text style={styles.warningText}>
              Video generation takes 1-5 minutes. You'll be shown progress while it processes.
            </Text>
          </View>

          <GradientButton
            label={isPending ? 'Generating Video...' : 'Generate Video'}
            onPress={handleGenerate}
            loading={isPending}
            disabled={!prompt.trim() || isPending}
            size="lg"
            fullWidth
            glowEffect
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backIcon: {
    fontSize: 18,
    color: Colors.textPrimary,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  durationValue: {
    color: Colors.primary,
    textTransform: 'none',
  },
  modelRow: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  durationBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  durationBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  durationBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  durationBtnTextActive: {
    color: Colors.accent,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
  },
  uploadIcon: {
    fontSize: 28,
  },
  uploadText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  uploadSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  frameContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 140,
  },
  frameImage: {
    width: '100%',
    height: '100%',
  },
  frameOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 12,
    color: Colors.white,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  removeBtn: {
    backgroundColor: 'rgba(239,68,68,0.85)',
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  warningIcon: {
    fontSize: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning,
    lineHeight: 19,
  },
});
