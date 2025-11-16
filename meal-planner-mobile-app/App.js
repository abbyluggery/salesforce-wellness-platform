import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import MealPlanScreen from './src/screens/MealPlanScreen';
import ShoppingScreen from './src/screens/ShoppingScreen';
import CouponsScreen from './src/screens/CouponsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import database
import { initDatabase } from './src/database/db';

const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4bca81',
    accent: '#f39c12',
    background: '#f4f6f9',
    surface: '#ffffff',
    text: '#2c3e50',
    error: '#e74c3c',
    success: '#27ae60',
  },
};

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    async function setupDatabase() {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }
    setupDatabase();
  }, []);

  if (!dbInitialized) {
    return null; // You could add a loading screen here
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                switch (route.name) {
                  case 'Dashboard':
                    iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                    break;
                  case 'Recipes':
                    iconName = focused ? 'book-open-page-variant' : 'book-open-outline';
                    break;
                  case 'Meal Plan':
                    iconName = focused ? 'calendar-check' : 'calendar-check-outline';
                    break;
                  case 'Shopping':
                    iconName = focused ? 'cart' : 'cart-outline';
                    break;
                  case 'Coupons':
                    iconName = focused ? 'ticket-percent' : 'ticket-percent-outline';
                    break;
                  case 'Settings':
                    iconName = focused ? 'cog' : 'cog-outline';
                    break;
                  default:
                    iconName = 'circle';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: 'gray',
              tabBarStyle: {
                backgroundColor: '#ffffff',
                borderTopWidth: 1,
                borderTopColor: '#e5e5e5',
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
              },
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            <Tab.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'Meal Planner AI' }}
            />
            <Tab.Screen
              name="Recipes"
              component={RecipesScreen}
              options={{ title: 'Recipe Book' }}
            />
            <Tab.Screen
              name="Meal Plan"
              component={MealPlanScreen}
              options={{ title: 'Weekly Planner' }}
            />
            <Tab.Screen
              name="Shopping"
              component={ShoppingScreen}
              options={{ title: 'Shopping Lists' }}
            />
            <Tab.Screen
              name="Coupons"
              component={CouponsScreen}
              options={{ title: 'Coupon Savings' }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
