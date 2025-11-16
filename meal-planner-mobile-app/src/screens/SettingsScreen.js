import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Alert, Linking } from 'react-native';
import { Card, Title, Paragraph, Button, List, Switch, Divider, Text, Portal, Dialog } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserPreferences, saveUserPreferences } from '../database/db';

const SettingsScreen = () => {
  const [preferences, setPreferences] = useState({
    household_size: 2,
    dietary_restrictions: '',
    allergies: '',
    preferred_cuisines: '',
    disliked_ingredients: '',
    budget_per_week: '',
    preferred_stores: '',
    meal_prep_day: 'Sunday',
    shopping_day: 'Saturday',
    breakfast_enabled: 1,
    lunch_enabled: 1,
    dinner_enabled: 1,
    claude_api_key: '',
    notifications_enabled: 1,
  });

  const [showApiDialog, setShowApiDialog] = useState(false);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getUserPreferences();
      if (prefs) {
        setPreferences(prefs);
        setTempApiKey(prefs.claude_api_key || '');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await saveUserPreferences(preferences);
      setShowPreferencesDialog(false);
      Alert.alert('Success', 'Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    }
  };

  const handleSaveApiKey = async () => {
    try {
      await saveUserPreferences({ ...preferences, claude_api_key: tempApiKey });
      setPreferences({ ...preferences, claude_api_key: tempApiKey });
      setShowApiDialog(false);
      Alert.alert('Success', 'API key saved successfully');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const handleToggleSetting = async (key) => {
    const newValue = preferences[key] === 1 ? 0 : 1;
    const newPrefs = { ...preferences, [key]: newValue };
    setPreferences(newPrefs);
    try {
      await saveUserPreferences({ [key]: newValue });
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Household Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Household Settings</Title>

          <List.Item
            title="Household Size"
            description={`${preferences.household_size} people`}
            left={(props) => <List.Icon {...props} icon="account-group" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPreferencesDialog(true)}
          />

          <Divider />

          <List.Item
            title="Dietary Restrictions"
            description={preferences.dietary_restrictions || 'Not set'}
            left={(props) => <List.Icon {...props} icon="food-apple" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPreferencesDialog(true)}
          />

          <Divider />

          <List.Item
            title="Weekly Budget"
            description={preferences.budget_per_week ? `$${preferences.budget_per_week}` : 'Not set'}
            left={(props) => <List.Icon {...props} icon="currency-usd" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPreferencesDialog(true)}
          />
        </Card.Content>
      </Card>

      {/* Meal Planning */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Meal Planning</Title>

          <List.Item
            title="Meal Prep Day"
            description={preferences.meal_prep_day}
            left={(props) => <List.Icon {...props} icon="calendar" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPreferencesDialog(true)}
          />

          <Divider />

          <List.Item
            title="Shopping Day"
            description={preferences.shopping_day}
            left={(props) => <List.Icon {...props} icon="cart" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPreferencesDialog(true)}
          />

          <Divider />

          <List.Item
            title="Include Breakfast"
            left={(props) => <List.Icon {...props} icon="coffee" />}
            right={() => (
              <Switch
                value={preferences.breakfast_enabled === 1}
                onValueChange={() => handleToggleSetting('breakfast_enabled')}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Include Lunch"
            left={(props) => <List.Icon {...props} icon="food-apple" />}
            right={() => (
              <Switch
                value={preferences.lunch_enabled === 1}
                onValueChange={() => handleToggleSetting('lunch_enabled')}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Include Dinner"
            left={(props) => <List.Icon {...props} icon="food-variant" />}
            right={() => (
              <Switch
                value={preferences.dinner_enabled === 1}
                onValueChange={() => handleToggleSetting('dinner_enabled')}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* AI Integration */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>AI Integration</Title>
          <Paragraph style={styles.description}>
            Connect Claude AI for intelligent meal planning, recipe suggestions, and shopping list optimization.
          </Paragraph>

          <List.Item
            title="Claude API Key"
            description={preferences.claude_api_key ? `••••${preferences.claude_api_key.slice(-4)}` : 'Not configured'}
            left={(props) => <List.Icon {...props} icon="brain" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowApiDialog(true)}
          />

          <Button
            mode="outlined"
            icon="open-in-new"
            onPress={() => Linking.openURL('https://console.anthropic.com/')}
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
            description="Meal prep and shopping reminders"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={preferences.notifications_enabled === 1}
                onValueChange={() => handleToggleSetting('notifications_enabled')}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* About */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>About</Title>
          <Paragraph style={styles.aboutText}>Meal Planner AI v1.0.0</Paragraph>
          <Paragraph style={styles.aboutText}>
            Plan your meals, save with coupons, and eat healthier with AI-powered meal planning.
          </Paragraph>
          <Paragraph style={styles.aboutText}>
            Powered by Claude AI from Anthropic
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Preferences Dialog */}
      <Portal>
        <Dialog visible={showPreferencesDialog} onDismiss={() => setShowPreferencesDialog(false)}>
          <Dialog.Title>Household Preferences</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TextInput
                label="Household Size"
                value={String(preferences.household_size)}
                onChangeText={(text) => setPreferences({ ...preferences, household_size: parseInt(text) || 2 })}
                keyboardType="numeric"
                style={styles.input}
                placeholder="2"
              />
              <TextInput
                label="Dietary Restrictions"
                value={preferences.dietary_restrictions}
                onChangeText={(text) => setPreferences({ ...preferences, dietary_restrictions: text })}
                style={styles.input}
                placeholder="e.g. Vegetarian, Vegan, Gluten-free"
              />
              <TextInput
                label="Allergies"
                value={preferences.allergies}
                onChangeText={(text) => setPreferences({ ...preferences, allergies: text })}
                style={styles.input}
                placeholder="e.g. Peanuts, Shellfish"
              />
              <TextInput
                label="Preferred Cuisines"
                value={preferences.preferred_cuisines}
                onChangeText={(text) => setPreferences({ ...preferences, preferred_cuisines: text })}
                style={styles.input}
                placeholder="e.g. Italian, Mexican, Asian"
              />
              <TextInput
                label="Disliked Ingredients"
                value={preferences.disliked_ingredients}
                onChangeText={(text) => setPreferences({ ...preferences, disliked_ingredients: text })}
                style={styles.input}
                placeholder="e.g. Mushrooms, Cilantro"
              />
              <TextInput
                label="Weekly Budget"
                value={preferences.budget_per_week}
                onChangeText={(text) => setPreferences({ ...preferences, budget_per_week: text })}
                keyboardType="numeric"
                style={styles.input}
                placeholder="150"
              />
              <TextInput
                label="Preferred Stores"
                value={preferences.preferred_stores}
                onChangeText={(text) => setPreferences({ ...preferences, preferred_stores: text })}
                style={styles.input}
                placeholder="e.g. Publix, Walmart, Costco"
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowPreferencesDialog(false)}>Cancel</Button>
            <Button onPress={handleSavePreferences}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        {/* API Key Dialog */}
        <Dialog visible={showApiDialog} onDismiss={() => setShowApiDialog(false)}>
          <Dialog.Title>Claude API Key</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.dialogText}>
              Enter your Claude API key from Anthropic Console. This key is stored securely on your device.
            </Paragraph>
            <TextInput
              placeholder="sk-ant-api03-..."
              value={tempApiKey}
              onChangeText={setTempApiKey}
              secureTextEntry
              style={styles.input}
            />
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
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  card: { margin: 16, marginBottom: 0, marginTop: 16, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, color: '#7f8c8d', marginBottom: 16, lineHeight: 20 },
  linkButton: { marginTop: 8 },
  aboutText: { fontSize: 14, color: '#7f8c8d', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  dialogText: { fontSize: 14, color: '#7f8c8d', marginBottom: 16, lineHeight: 20 },
});

export default SettingsScreen;
