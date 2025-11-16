import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-chart-kit';
import {
  getActiveMealPlan,
  getPlannedMealsByDateRange,
  getShoppingLists,
  getCoupons,
  getRecipes,
  getMealPlanStats
} from '../database/db';
import { format, addDays } from 'date-fns';

const DashboardScreen = ({ navigation }) => {
  const [activePlan, setActivePlan] = useState(null);
  const [thisWeekMeals, setThisWeekMeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeShoppingLists, setActiveShoppingLists] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [recipeCount, setRecipeCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load active meal plan
      const plan = await getActiveMealPlan();
      setActivePlan(plan);

      // Load this week's meals
      const today = new Date();
      const weekEnd = addDays(today, 7);
      const meals = await getPlannedMealsByDateRange(
        format(today, 'yyyy-MM-dd'),
        format(weekEnd, 'yyyy-MM-dd')
      );
      setThisWeekMeals(meals);

      // Load stats
      if (plan) {
        const planStats = await getMealPlanStats(plan.id);
        setStats(planStats);
      }

      // Load shopping lists
      const lists = await getShoppingLists();
      setActiveShoppingLists(lists.filter(l => !l.is_completed).slice(0, 2));

      // Load available coupons
      const coupons = await getCoupons({ isClipped: false });
      setAvailableCoupons(coupons.slice(0, 5));

      // Load recipe count
      const recipes = await getRecipes();
      setRecipeCount(recipes.length);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const getMealTypeIcon = (mealType) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast': return 'coffee';
      case 'lunch': return 'food-apple';
      case 'dinner': return 'food-variant';
      default: return 'silverware-fork-knife';
    }
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(75, 202, 129, ${opacity})`,
  };

  const categoryData = stats?.byCategory.map((cat, index) => ({
    name: cat.category,
    population: cat.count,
    color: ['#4bca81', '#f39c12', '#3498db'][index % 3],
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  })) || [];

  return (
    <ScrollView style={styles.container}>
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="book-open-page-variant" size={28} color="#4bca81" />
            <Title style={styles.statNumber}>{recipeCount}</Title>
            <Paragraph style={styles.statLabel}>Recipes</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="calendar-check" size={28} color="#3498db" />
            <Title style={styles.statNumber}>{thisWeekMeals.length}</Title>
            <Paragraph style={styles.statLabel}>This Week</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="ticket-percent" size={28} color="#f39c12" />
            <Title style={styles.statNumber}>{availableCoupons.length}</Title>
            <Paragraph style={styles.statLabel}>Coupons</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Active Meal Plan */}
      {activePlan ? (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Active Meal Plan</Title>
            <Paragraph style={styles.planName}>{activePlan.name}</Paragraph>
            <View style={styles.planDates}>
              <Icon name="calendar-range" size={16} color="#7f8c8d" />
              <Paragraph style={styles.dateText}>
                {format(new Date(activePlan.start_date), 'MMM dd')} -
                {format(new Date(activePlan.end_date), 'MMM dd, yyyy')}
              </Paragraph>
            </View>
            {stats && (
              <View style={styles.progressContainer}>
                <Paragraph style={styles.progressText}>
                  {stats.completed} of {stats.total} meals completed
                </Paragraph>
              </View>
            )}
            {categoryData.length > 0 && (
              <PieChart
                data={categoryData}
                width={Dimensions.get('window').width - 60}
                height={180}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            )}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Meal Plan')}
              style={styles.viewButton}
            >
              View Full Plan
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>No Active Meal Plan</Title>
            <Paragraph style={styles.emptyText}>
              Create a meal plan to get started with organized weekly meals
            </Paragraph>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('Meal Plan')}
              style={styles.createButton}
            >
              Create Meal Plan
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* This Week's Meals */}
      {thisWeekMeals.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>This Week's Meals</Title>
            {thisWeekMeals.slice(0, 5).map((meal) => (
              <Card key={meal.id} style={styles.mealCard}>
                <Card.Content>
                  <View style={styles.mealHeader}>
                    <Icon
                      name={getMealTypeIcon(meal.meal_type)}
                      size={20}
                      color="#4bca81"
                    />
                    <Paragraph style={styles.mealDate}>
                      {format(new Date(meal.meal_date), 'EEE, MMM dd')}
                    </Paragraph>
                  </View>
                  <Paragraph style={styles.mealName}>{meal.recipe_name}</Paragraph>
                  <Chip
                    style={styles.mealTypeChip}
                    textStyle={styles.mealTypeText}
                  >
                    {meal.meal_type}
                  </Chip>
                </Card.Content>
              </Card>
            ))}
            <Button
              mode="text"
              onPress={() => navigation.navigate('Meal Plan')}
            >
              View All
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Shopping Lists */}
      {activeShoppingLists.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Active Shopping Lists</Title>
            {activeShoppingLists.map((list) => (
              <Card key={list.id} style={styles.listCard}>
                <Card.Content>
                  <View style={styles.listHeader}>
                    <Icon name="cart" size={20} color="#3498db" />
                    <Paragraph style={styles.listName}>{list.name}</Paragraph>
                  </View>
                  <Paragraph style={styles.listDate}>
                    Created {format(new Date(list.created_at), 'MMM dd, yyyy')}
                  </Paragraph>
                </Card.Content>
              </Card>
            ))}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Shopping')}
            >
              View All Lists
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Available Coupons */}
      {availableCoupons.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Available Coupons</Title>
            {availableCoupons.map((coupon) => (
              <Card key={coupon.id} style={styles.couponCard}>
                <Card.Content>
                  <View style={styles.couponHeader}>
                    <Icon name="ticket-percent" size={20} color="#f39c12" />
                    <Paragraph style={styles.couponProduct}>
                      {coupon.product_name}
                    </Paragraph>
                  </View>
                  <View style={styles.couponDetails}>
                    <Chip style={styles.discountChip} textStyle={styles.discountText}>
                      Save ${coupon.discount_value}
                    </Chip>
                    <Paragraph style={styles.couponExpiry}>
                      Expires {format(new Date(coupon.expiration_date), 'MMM dd')}
                    </Paragraph>
                  </View>
                </Card.Content>
              </Card>
            ))}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Coupons')}
            >
              View All Coupons
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Quick Actions</Title>
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              icon="calendar-plus"
              onPress={() => navigation.navigate('Meal Plan')}
              style={styles.actionButton}
            >
              Plan Meals
            </Button>
            <Button
              mode="contained"
              icon="cart-plus"
              onPress={() => navigation.navigate('Shopping')}
              style={[styles.actionButton, { backgroundColor: '#3498db' }]}
            >
              Create List
            </Button>
            <Button
              mode="contained"
              icon="book-plus"
              onPress={() => navigation.navigate('Recipes')}
              style={[styles.actionButton, { backgroundColor: '#f39c12' }]}
            >
              Find Recipes
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 0,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  planDates: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7f8c8d',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  viewButton: {
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
  },
  mealCard: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealDate: {
    marginLeft: 8,
    fontSize: 12,
    color: '#7f8c8d',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealTypeChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f4f8',
    height: 24,
  },
  mealTypeText: {
    fontSize: 11,
    color: '#0176d3',
  },
  listCard: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  listName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  listDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  couponCard: {
    marginBottom: 12,
    backgroundColor: '#fff8e1',
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  couponProduct: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  couponDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountChip: {
    backgroundColor: '#f39c12',
    height: 24,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  couponExpiry: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default DashboardScreen;
