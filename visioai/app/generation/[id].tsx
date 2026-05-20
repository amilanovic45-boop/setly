import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Alert,
  Share,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useAppStore } from '../../lib/store';
import { useDeleteGeneration } from '../../lib/hooks/useGenerations';
import { Colors } from '../../constants/colors';
import { GradientButton } from '../../components/ui/GradientButton';
import { ProgressRing } from '../../components/ui/ProgressRing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ActionButton({
  icon,
  label,
  onPress,
  delay = 0,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  delay?: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 350 }));
  }, [delay, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.actionBtn, animStyle]}>
      <Pressable onPress={onPress} style={styles.actionBtnInner}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <Text style={styles.actionLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function GenerationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { generations } = useAppStore();
  const { mutate: deleteGen } = useDeleteGeneration();
  const [videoLooping, setVideoLooping] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const videoRef = useRef<Video>(null);

  const generation = generations.find(g => g.id === id);

  if (!generation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFoundText}>Generation not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (generation.status === 'processing' || generation.status === 'pending') {
    return (
      <SafeAreaView style={[styles.container, styles.processingContainer]}>
        <View style={styles.processingContent}>
          <ProgressRing size={80} indeterminate color={Colors.primary} />
          <Text style={styles.processingTitle}>
            {generation.type === 'video' ? 'Creating Video' : 'Generating Image'}
          </Text>
          <Text style={styles.processingSubtitle}>
            {generation.prompt.slice(0, 80)}...
          </Text>
          <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>← Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (generation.status === 'failed') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>❌</Text>
          <Text style={styles.notFoundText}>Generation Failed</Text>
          <Text style={styles.errorMessage}>{generation.errorMessage ?? 'Unknown error'}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleDownload = async () => {
    const url = generation.mediaUrls[currentImageIndex] ?? generation.mediaUrls[0];
    if (!url) {
      Toast.show({ type: 'error', text1: 'No media to download' });
      return;
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission denied', text2: 'Allow media library access in Settings' });
      return;
    }

    try {
      Toast.show({ type: 'info', text1: 'Downloading...' });
      const extension = generation.type === 'video' ? 'mp4' : 'jpg';
      const filename = `visioai-${generation.id}.${extension}`;
      const downloadPath = `${FileSystem.cacheDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(url, downloadPath);
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      Toast.show({ type: 'success', text1: 'Saved to Photos!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Download failed' });
    }
  };

  const handleShare = async () => {
    const url = generation.mediaUrls[currentImageIndex] ?? generation.mediaUrls[0];
    if (!url) return;

    try {
      await Share.share({
        message: `Check out this AI-generated ${generation.type}: ${url}`,
        url,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Share failed' });
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Generation?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteGen(generation.id);
          router.back();
        },
      },
    ]);
  };

  const mediaUrl = generation.mediaUrls[currentImageIndex] ?? generation.mediaUrls[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {generation.type === 'video' ? '▶ Video' : '◼ Image'}
          </Text>
        </View>
        <Pressable onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>🗑</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.mediaContainer}>
          {generation.type === 'video' && mediaUrl ? (
            <Video
              ref={videoRef}
              source={{ uri: mediaUrl }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={videoLooping}
              shouldPlay
              useNativeControls
            />
          ) : mediaUrl ? (
            <Image
              source={{ uri: mediaUrl }}
              style={styles.image}
              contentFit="contain"
              transition={400}
            />
          ) : null}

          {generation.type === 'video' && (
            <Pressable
              onPress={() => setVideoLooping(!videoLooping)}
              style={[styles.loopBtn, videoLooping && styles.loopBtnActive]}
            >
              <Text style={styles.loopBtnText}>
                {videoLooping ? '∞ Loop On' : '∞ Loop Off'}
              </Text>
            </Pressable>
          )}
        </View>

        {generation.mediaUrls.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnails}>
            {generation.mediaUrls.map((url, i) => (
              <Pressable key={i} onPress={() => setCurrentImageIndex(i)}>
                <Image
                  source={{ uri: url }}
                  style={[styles.thumb, i === currentImageIndex && styles.thumbActive]}
                  contentFit="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.actions}>
          <ActionButton icon="⬇" label="Download" onPress={handleDownload} delay={0} />
          <ActionButton icon="↗" label="Share" onPress={handleShare} delay={80} />
          <ActionButton icon="🔄" label="Remake" onPress={() => router.push(`/studio/${generation.type}`)} delay={160} />
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaTitle}>Prompt</Text>
          <Text style={styles.promptText}>{generation.prompt}</Text>

          <View style={styles.metaGrid}>
            <MetaItem label="Model" value={generation.model.replace(/_/g, ' ')} />
            <MetaItem label="Ratio" value={generation.aspectRatio} />
            <MetaItem
              label="Created"
              value={new Date(generation.createdAt).toLocaleDateString()}
            />
            <MetaItem label="Type" value={generation.type} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaItemLabel}>{label}</Text>
      <Text style={styles.metaItemValue}>{value}</Text>
    </View>
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
  headerBadge: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerBadgeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 18,
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    backgroundColor: Colors.surface,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 9 / 16,
  },
  loopBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  loopBtnActive: {
    backgroundColor: Colors.primaryDim,
  },
  loopBtnText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  thumbnails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  thumbActive: {
    borderColor: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionBtn: {
    flex: 1,
  },
  actionBtnInner: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  meta: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  metaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  promptText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 23,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: '45%',
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaItemLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaItemValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundEmoji: {
    fontSize: 48,
  },
  notFoundText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  backLink: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backLinkText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContent: {
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  processingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelBtnText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
