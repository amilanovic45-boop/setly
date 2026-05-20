import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAppStore } from '../../lib/store';
import { useBalance } from '../../lib/hooks/useBalance';
import { clearApiKey, saveApiKey } from '../../lib/api/higgsfield';
import { Colors } from '../../constants/colors';
import { CreditsDisplay } from '../../components/shared/CreditsDisplay';
import { GradientButton } from '../../components/ui/GradientButton';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function SettingRow({
  label,
  value,
  onPress,
  rightElement,
  danger = false,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.settingRow} disabled={!onPress && !rightElement}>
      <Text style={[styles.settingLabel, danger && styles.dangerText]}>{label}</Text>
      {rightElement ?? (value ? <Text style={styles.settingValue}>{value}</Text> : null)}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { balance, generations, settings, apiKey, setApiKey, setBalance, setOnboarded, updateSettings } = useAppStore();
  const { refetch: refetchBalance, isLoading: balanceLoading } = useBalance();

  const [editingKey, setEditingKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  const totalImages = generations.filter(g => g.type === 'image').length;
  const totalVideos = generations.filter(g => g.type === 'video').length;

  const maskedKey = apiKey
    ? apiKey.slice(0, 8) + '••••••••' + apiKey.slice(-4)
    : 'Not connected';

  const handleSaveKey = async () => {
    if (!newKey.trim()) {
      Toast.show({ type: 'error', text1: 'Enter a valid API key' });
      return;
    }
    setSavingKey(true);
    try {
      await saveApiKey(newKey.trim());
      setApiKey(newKey.trim());
      setEditingKey(false);
      setNewKey('');
      await refetchBalance();
      Toast.show({ type: 'success', text1: 'API key updated' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save key' });
    } finally {
      setSavingKey(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect API Key?',
      'You will need to reconnect to generate content.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await clearApiKey();
            setApiKey(null);
            setBalance(null);
            Toast.show({ type: 'success', text1: 'Disconnected' });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.username}>Creator</Text>
          <Text style={styles.userSubtitle}>{balance?.plan ?? 'Free'} Plan</Text>
        </View>

        <CreditsDisplay balance={balance} />

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalImages}</Text>
            <Text style={styles.statLabel}>Images</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalVideos}</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{generations.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <Section title="API Connection">
          {editingKey ? (
            <View style={styles.keyEditor}>
              <TextInput
                value={newKey}
                onChangeText={setNewKey}
                placeholder="Enter new API key..."
                placeholderTextColor={Colors.textMuted}
                style={styles.keyInput}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <View style={styles.keyActions}>
                <GradientButton
                  label="Save"
                  onPress={handleSaveKey}
                  loading={savingKey}
                  size="sm"
                  style={{ flex: 1 }}
                />
                <GradientButton
                  label="Cancel"
                  onPress={() => { setEditingKey(false); setNewKey(''); }}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <>
              <SettingRow
                label="API Key"
                value={maskedKey}
                onPress={() => setEditingKey(true)}
              />
              <SettingRow
                label="Refresh Balance"
                onPress={() => refetchBalance()}
                value={balanceLoading ? 'Loading...' : 'Tap to refresh'}
              />
              {apiKey && (
                <SettingRow
                  label="Disconnect"
                  onPress={handleDisconnect}
                  danger
                />
              )}
            </>
          )}
        </Section>

        <Section title="Preferences">
          <SettingRow
            label="Default Image Model"
            value={settings.defaultImageModel.replace(/_/g, ' ')}
          />
          <SettingRow
            label="Default Aspect Ratio"
            value={settings.defaultAspectRatio}
          />
          <SettingRow
            label="Notifications"
            rightElement={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />
        </Section>

        <Section title="About">
          <SettingRow label="Version" value="1.0.0" />
          <SettingRow label="Powered by Higgsfield AI" />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  sectionContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    maxWidth: 180,
    textAlign: 'right',
  },
  dangerText: {
    color: Colors.error,
  },
  keyEditor: {
    padding: 16,
    gap: 12,
  },
  keyInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    fontFamily: 'monospace',
  },
  keyActions: {
    flexDirection: 'row',
    gap: 10,
  },
});
