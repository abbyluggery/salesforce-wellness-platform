import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import JobSearchScreen from './src/screens/JobSearchScreen';
import ApplicationsScreen from './src/screens/ApplicationsScreen';
import ResumesScreen from './src/screens/ResumesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import database
import { initDatabase } from './src/database/db';

const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0176d3',
    accent: '#00a1e0',
    background: '#f4f6f9',
    surface: '#ffffff',
    text: '#16325c',
    error: '#ea001e',
    success: '#4bca81',
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
                  case 'Search':
                    iconName = focused ? 'briefcase-search' : 'briefcase-search-outline';
                    break;
                  case 'Applications':
                    iconName = focused ? 'clipboard-text' : 'clipboard-text-outline';
                    break;
                  case 'Resumes':
                    iconName = focused ? 'file-document' : 'file-document-outline';
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
              options={{ title: 'Job Search AI' }}
            />
            <Tab.Screen
              name="Search"
              component={JobSearchScreen}
              options={{ title: 'Find Jobs' }}
            />
            <Tab.Screen
              name="Applications"
              component={ApplicationsScreen}
              options={{ title: 'My Applications' }}
            />
            <Tab.Screen
              name="Resumes"
              component={ResumesScreen}
              options={{ title: 'Resume Builder' }}
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
