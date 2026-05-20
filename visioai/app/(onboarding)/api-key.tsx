import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Colors } from '../../constants/colors';
import { GradientButton } from '../../components/ui/GradientButton';
import { saveApiKey, checkBalance } from '../../lib/api/higgsfield';
import { useAppStore } from '../../lib/store';

export default function ApiKeyScreen() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const { setApiKey: storeApiKey, setBalance, setOnboarded } = useAppStore();

  const handleConnect = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      Toast.show({ type: 'error', text1: 'Please enter your API key' });
      return;
    }

    setLoading(true);
    try {
      await saveApiKey(trimmed);
      storeApiKey(trimmed);

      const balance = await checkBalance();
      setBalance(balance);
      setOnboarded(true);

      Toast.show({
        type: 'success',
        text1: 'Connected!',
        text2: `${balance.credits} credits available`,
      });

      router.replace('/(tabs)');
    } catch (err) {
      await saveApiKey('');
      storeApiKey(null);
      Toast.show({
        type: 'error',
        text1: 'Connection failed',
        text2: 'Check your API key and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip API Setup?',
      'You can add your Higgsfield API key later in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip for now',
          onPress: () => {
            setOnboarded(true);
            router.replace('/(tabs)');
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.background, Colors.surface]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[Colors.primary, '#5B21B6']}
              style={styles.icon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.iconEmoji}>🔑</Text>
            </LinearGradient>
          </View>

          <Text style={styles.title}>Connect Your Account</Text>
          <Text style={styles.subtitle}>
            Enter your Higgsfield AI API key to start generating images and videos.
          </Text>

          <View style={styles.instructions}>
            {['Visit higgsfield.ai', 'Go to Account → API Keys', 'Create a new key', 'Paste it below'].map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>API Key</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="hf-xxxxxxxxxxxxxxxxxxxxxxxx"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowKey(!showKey)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>{showKey ? '🙈' : '👁'}</Text>
              </Pressable>
            </View>
          </View>

          <GradientButton
            label="Connect"
            onPress={handleConnect}
            loading={loading}
            disabled={!apiKey.trim() || loading}
            size="lg"
            fullWidth
            style={styles.connectButton}
          />

          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>

          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Your API key is stored securely using encrypted storage and never shared.
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  instructions: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'monospace',
  },
  eyeButton: {
    padding: 14,
  },
  eyeIcon: {
    fontSize: 18,
  },
  connectButton: {
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  skipText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    width: '100%',
  },
  securityIcon: {
    fontSize: 16,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: Colors.success,
    lineHeight: 20,
  },
});
