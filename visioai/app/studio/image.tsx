import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { useGenerateImage } from '../../lib/hooks/useGenerations';
import { useAppStore } from '../../lib/store';
import { uploadMedia } from '../../lib/api/higgsfield';
import { Colors } from '../../constants/colors';
import { GradientButton } from '../../components/ui/GradientButton';
import { ModelCard } from '../../components/ui/ModelCard';
import { PromptInput } from '../../components/ui/PromptInput';
import { AspectRatioPicker } from '../../components/shared/AspectRatioPicker';
import { IMAGE_MODELS } from '../../constants/models';
import type { AspectRatio, ImageModel } from '../../types';

export default function ImageStudioScreen() {
  const { settings } = useAppStore();
  const { mutateAsync: generate, isPending } = useGenerateImage();

  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<ImageModel>(settings.defaultImageModel);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(settings.defaultAspectRatio);
  const [numImages, setNumImages] = useState(1);
  const [referenceUri, setReferenceUri] = useState<string | null>(null);
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [uploadingRef, setUploadingRef] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [styleStrength, setStyleStrength] = useState(0.7);

  const handlePickReference = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setReferenceUri(asset.uri);
      setUploadingRef(true);
      try {
        const uploaded = await uploadMedia(asset.uri, asset.mimeType ?? 'image/jpeg');
        setReferenceUrl(uploaded.url);
        Toast.show({ type: 'success', text1: 'Reference image uploaded' });
      } catch {
        setReferenceUri(null);
        Toast.show({ type: 'error', text1: 'Failed to upload reference image' });
      } finally {
        setUploadingRef(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a prompt' });
      return;
    }

    try {
      const generation = await generate({
        prompt: prompt.trim(),
        model: selectedModel,
        aspectRatio,
        numImages,
        referenceImageUrl: referenceUrl ?? undefined,
        styleStrength,
      });

      router.push(`/generation/${generation.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      Toast.show({ type: 'error', text1: 'Generation failed', text2: message });
    }
  };

  const selectedModelInfo = IMAGE_MODELS.find(m => m.id === selectedModel);

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
          <Text style={styles.title}>Image Studio</Text>
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
            placeholder="A cinematic portrait of a woman in golden hour light, shallow depth of field, film grain..."
          />

          <View>
            <Text style={styles.sectionLabel}>Model</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.modelRow}>
                {IMAGE_MODELS.map(model => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    selected={selectedModel === model.id}
                    onSelect={(m) => setSelectedModel(m.id as ImageModel)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          <AspectRatioPicker
            selected={aspectRatio}
            options={selectedModelInfo?.aspectRatios ?? ['1:1', '9:16', '16:9', '3:4', '4:3']}
            onChange={setAspectRatio}
          />

          <Pressable
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={styles.advancedToggle}
          >
            <Text style={styles.advancedLabel}>
              {showAdvanced ? '▼' : '▶'} Advanced Settings
            </Text>
          </Pressable>

          {showAdvanced && (
            <View style={styles.advanced}>
              <View>
                <Text style={styles.sectionLabel}>Number of Images</Text>
                <View style={styles.numRow}>
                  {[1, 2, 3, 4].map(n => (
                    <Pressable
                      key={n}
                      onPress={() => setNumImages(n)}
                      style={[styles.numBtn, numImages === n && styles.numBtnActive]}
                    >
                      <Text style={[styles.numBtnText, numImages === n && styles.numBtnTextActive]}>
                        {n}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.sectionLabel}>Reference Image</Text>
                {referenceUri ? (
                  <View style={styles.refImageContainer}>
                    <Image
                      source={{ uri: referenceUri }}
                      style={styles.refImage}
                      contentFit="cover"
                    />
                    <View style={styles.refImageOverlay}>
                      {uploadingRef && (
                        <Text style={styles.uploadingText}>Uploading...</Text>
                      )}
                      <Pressable
                        onPress={() => { setReferenceUri(null); setReferenceUrl(null); }}
                        style={styles.removeRef}
                      >
                        <Text style={styles.removeRefText}>✕ Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable onPress={handlePickReference} style={styles.uploadArea}>
                    <Text style={styles.uploadIcon}>📎</Text>
                    <Text style={styles.uploadText}>Add reference image</Text>
                    <Text style={styles.uploadSubtext}>From camera roll or photos</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          <GradientButton
            label={isPending ? 'Generating...' : `Generate ${numImages > 1 ? `${numImages} Images` : 'Image'}`}
            onPress={handleGenerate}
            loading={isPending}
            disabled={!prompt.trim() || isPending}
            size="lg"
            fullWidth
            glowEffect
            style={styles.generateBtn}
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
  modelRow: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  advancedLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  advanced: {
    gap: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  numRow: {
    flexDirection: 'row',
    gap: 10,
  },
  numBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  numBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim,
  },
  numBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  numBtnTextActive: {
    color: Colors.primary,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 24,
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
  refImageContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 160,
  },
  refImage: {
    width: '100%',
    height: '100%',
  },
  refImageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 12,
    color: Colors.white,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  removeRef: {
    backgroundColor: 'rgba(239,68,68,0.8)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeRefText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  generateBtn: {
    marginTop: 8,
  },
});
