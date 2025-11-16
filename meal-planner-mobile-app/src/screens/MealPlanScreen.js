import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, Portal, Dialog, TextInput, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getActiveMealPlan, getPlannedMeals, createMealPlan } from '../database/db';
import { generateMealPlan } from '../services/claudeService';
import { format, addDays } from 'date-fns';

const MealPlanScreen = () => {
  const [activePlan, setActivePlan] = useState(null);
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    duration: 14,
    numberOfPeople: 2,
  });

  useEffect(() => {
    loadActivePlan();
  }, []);

  const loadActivePlan = async () => {
    try {
      const plan = await getActiveMealPlan();
      setActivePlan(plan);
      if (plan) {
        const meals = await getPlannedMeals(plan.id);
        setPlannedMeals(meals);
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  };

  const handleGenerateWithAI = async () => {
    setGenerating(true);
    try {
      const result = await generateMealPlan({
        duration: newPlan.duration,
        numberOfPeople: newPlan.numberOfPeople,
        dietaryRestrictions: '',
        allergies: '',
        budgetPerWeek: 150,
        mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
      });

      if (result.success) {
        const startDate = new Date(newPlan.startDate);
        const endDate = addDays(startDate, newPlan.duration - 1);

        const planId = await createMealPlan({
          name: newPlan.name || `Meal Plan`,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          numberOfPeople: newPlan.numberOfPeople,
          planType: newPlan.duration === 14 ? '2-week' : '6-week',
        });

        setShowCreateDialog(false);
        loadActivePlan();
        Alert.alert('Success', 'Meal plan generated with AI!');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate meal plan');
    } finally {
      setGenerating(false);
    }
  };

  const groupMealsByDate = () => {
    const grouped = {};
    plannedMeals.forEach(meal => {
      if (!grouped[meal.meal_date]) {
        grouped[meal.meal_date] = [];
      }
      grouped[meal.meal_date].push(meal);
    });
    return grouped;
  };

  const mealsByDate = groupMealsByDate();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {activePlan ? (
          <>
            <Card style={styles.planCard}>
              <Card.Content>
                <Title>{activePlan.name}</Title>
                <Paragraph>
                  {format(new Date(activePlan.start_date), 'MMM dd')} -
                  {format(new Date(activePlan.end_date), 'MMM dd, yyyy')}
                </Paragraph>
              </Card.Content>
            </Card>

            {Object.keys(mealsByDate).map(date => (
              <Card key={date} style={styles.dayCard}>
                <Card.Content>
                  <Title style={styles.dayTitle}>
                    {format(new Date(date), 'EEEE, MMM dd')}
                  </Title>
                  {mealsByDate[date].map(meal => (
                    <View key={meal.id} style={styles.mealItem}>
                      <Icon name="silverware-fork-knife" size={20} color="#4bca81" />
                      <View style={styles.mealInfo}>
                        <Paragraph style={styles.mealType}>{meal.meal_type}</Paragraph>
                        <Paragraph style={styles.mealName}>{meal.recipe_name}</Paragraph>
                      </View>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            ))}
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Icon name="calendar-blank" size={64} color="#bdc3c7" style={styles.emptyIcon} />
              <Title style={styles.emptyTitle}>No Active Meal Plan</Title>
              <Paragraph style={styles.emptyText}>
                Create a meal plan to organize your weekly meals
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setShowCreateDialog(true)} />

      <Portal>
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
          <Dialog.Title>Create Meal Plan</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Plan Name"
              value={newPlan.name}
              onChangeText={(text) => setNewPlan({ ...newPlan, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Number of People"
              value={String(newPlan.numberOfPeople)}
              onChangeText={(text) => setNewPlan({ ...newPlan, numberOfPeople: parseInt(text) || 2 })}
              keyboardType="numeric"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onPress={handleGenerateWithAI} loading={generating}>
              Generate with AI
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {generating && (
        <View style={styles.generatingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Paragraph style={styles.generatingText}>Generating meal plan...</Paragraph>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  scrollView: { flex: 1, padding: 16 },
  planCard: { marginBottom: 16, elevation: 2 },
  dayCard: { marginBottom: 12, elevation: 2 },
  dayTitle: { fontSize: 18, marginBottom: 12 },
  mealItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  mealInfo: { marginLeft: 12, flex: 1 },
  mealType: { fontSize: 12, color: '#7f8c8d', textTransform: 'uppercase' },
  mealName: { fontSize: 16, fontWeight: '600' },
  emptyCard: { marginTop: 60, alignItems: 'center' },
  emptyIcon: { alignSelf: 'center', marginBottom: 16 },
  emptyTitle: { textAlign: 'center', marginBottom: 8 },
  emptyText: { textAlign: 'center', color: '#7f8c8d' },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#4bca81' },
  input: { marginBottom: 12 },
  generatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingText: { color: '#fff', marginTop: 16 },
});

export default MealPlanScreen;
