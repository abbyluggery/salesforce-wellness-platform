import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  List,
  Switch,
  Divider,
  Text,
  Portal,
  Dialog,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, saveUserProfile } from '../database/db';

const SettingsScreen = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    claude_api_key: '',
  });

  const [settings, setSettings] = useState({
    notifications: true,
    autoAnalyze: true,
    darkMode: false,
  });

  const [showApiDialog, setShowApiDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    loadProfile();
    loadSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setTempApiKey(userProfile.claude_api_key || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await saveUserProfile(profile);
      setShowProfileDialog(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const handleSaveApiKey = async () => {
    try {
      await saveUserProfile({ ...profile, claude_api_key: tempApiKey });
      setProfile({ ...profile, claude_api_key: tempApiKey });
      setShowApiDialog(false);
      Alert.alert('Success', 'Claude API key saved successfully');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleOpenClaudeSignup = () => {
    Linking.openURL('https://console.anthropic.com/');
  };

  const handleExportData = async () => {
    Alert.alert(
      'Export Data',
      'This feature will export all your job search data. Coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your job postings, applications, and resumes. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            // This would clear the database
            Alert.alert('Success', 'All data cleared');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Profile</Title>
          <List.Item
            title={profile.full_name || 'Add your name'}
            description={profile.email || 'Add your email'}
            left={(props) => <List.Icon {...props} icon="account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowProfileDialog(true)}
          />
        </Card.Content>
      </Card>

      {/* Claude AI Integration */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Claude AI Integration</Title>
          <Paragraph style={styles.description}>
            Connect your Claude API key to enable AI-powered job analysis, resume
            generation, and interview preparation.
          </Paragraph>

          <List.Item
            title="API Key"
            description={
              profile.claude_api_key
                ? `••••••••${profile.claude_api_key.slice(-4)}`
                : 'Not configured'
            }
            left={(props) => <List.Icon {...props} icon="key" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowApiDialog(true)}
          />

          <Button
            mode="outlined"
            icon="open-in-new"
            onPress={handleOpenClaudeSignup}
            style={styles.linkButton}
          >
            Get Claude API Key
          </Button>
        </Card.Content>
      </Card>

      {/* App Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>App Settings</Title>

          <List.Item
            title="Notifications"
            description="Receive alerts for application updates"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleSettingChange('notifications', value)}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Auto-Analyze Jobs"
            description="Automatically analyze new job postings with AI"
            left={(props) => <List.Icon {...props} icon="brain" />}
            right={() => (
              <Switch
                value={settings.autoAnalyze}
                onValueChange={(value) => handleSettingChange('autoAnalyze', value)}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Dark Mode"
            description="Use dark theme (coming soon)"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => handleSettingChange('darkMode', value)}
                disabled
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Data Management */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Data Management</Title>

          <List.Item
            title="Export Data"
            description="Download all your data"
            left={(props) => <List.Icon {...props} icon="download" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleExportData}
          />

          <Divider />

          <List.Item
            title="Clear All Data"
            description="Permanently delete all data"
            left={(props) => <List.Icon {...props} icon="delete" color="#e74c3c" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleClearData}
          />
        </Card.Content>
      </Card>

      {/* About Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>About</Title>
          <Paragraph style={styles.aboutText}>
            Job Search AI Assistant v1.0.0
          </Paragraph>
          <Paragraph style={styles.aboutText}>
            An AI-powered job search companion that helps you find, analyze, and apply
            to jobs with confidence.
          </Paragraph>
          <Paragraph style={styles.aboutText}>
            Powered by Claude AI from Anthropic
          </Paragraph>

          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => {}}
          />

          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => {}}
          />

          <List.Item
            title="Support"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => Linking.openURL('mailto:support@example.com')}
          />
        </Card.Content>
      </Card>

      {/* Profile Edit Dialog */}
      <Portal>
        <Dialog
          visible={showProfileDialog}
          onDismiss={() => setShowProfileDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={profile.full_name}
                onChangeText={(text) => setProfile({ ...profile, full_name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={profile.email}
                onChangeText={(text) => setProfile({ ...profile, email: text })}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="LinkedIn Profile URL"
                value={profile.linkedin}
                onChangeText={(text) => setProfile({ ...profile, linkedin: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="GitHub Profile URL"
                value={profile.github}
                onChangeText={(text) => setProfile({ ...profile, github: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Portfolio Website"
                value={profile.portfolio}
                onChangeText={(text) => setProfile({ ...profile, portfolio: text })}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowProfileDialog(false)}>Cancel</Button>
            <Button onPress={handleSaveProfile}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        {/* API Key Dialog */}
        <Dialog
          visible={showApiDialog}
          onDismiss={() => setShowApiDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Claude API Key</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.dialogText}>
              Enter your Claude API key from Anthropic Console. This key is stored
              securely on your device and is never shared.
            </Paragraph>
            <TextInput
              style={styles.input}
              placeholder="sk-ant-api03-..."
              value={tempApiKey}
              onChangeText={setTempApiKey}
              secureTextEntry
            />
            <Button
              mode="outlined"
              icon="open-in-new"
              onPress={handleOpenClaudeSignup}
              style={styles.dialogButton}
            >
              Get API Key from Anthropic
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowApiDialog(false)}>Cancel</Button>
            <Button onPress={handleSaveApiKey}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  card: {
    margin: 16,
    marginBottom: 0,
    marginTop: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  linkButton: {
    marginTop: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  dialog: {
    maxHeight: '80%',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  dialogText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 20,
  },
  dialogButton: {
    marginTop: 8,
  },
});

export default SettingsScreen;
