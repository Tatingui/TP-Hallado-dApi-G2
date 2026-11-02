import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

// Auth Screens
import LoginScreen from '../app/(auth)/login';
import RegisterScreen from '../app/(auth)/register';
import VerifyOtpScreen from '../app/(auth)/verify-otp';
import ForgotPasswordScreen from '../app/(auth)/forgot-password';
import ResetPasswordScreen from '../app/(auth)/reset-password';
import NewPasswordScreen from '../app/(auth)/new-password';
import LockScreen from '../app/(auth)/lock';

// Main Tab Screens
import HomeScreen from '../app/(tabs)/home';
import PublishScreen from '../app/(tabs)/publish';
import MyPublicationsScreen from '../app/(tabs)/my-publications';
import ClaimsScreen from '../app/(tabs)/claims';
import ProfileScreen from '../app/(tabs)/profile';

// Detail & Modal Screens
import PublicationDetailScreen from '../app/publication/[id]';
import EditProfileScreen from '../app/profile/edit';
import PublicProfileScreen from '../app/profile/public/[id]';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.disabled || '#9CA3AF',
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PublishTab"
        component={PublishScreen}
        options={{
          title: 'Publicar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyPublicationsTab"
        component={MyPublicationsScreen}
        options={{
          title: 'Mis Publis',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ClaimsTab"
        component={ClaimsScreen}
        options={{
          title: 'Reclamos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack (Clase 8 - React Navigation)
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
            <Stack.Screen name="Lock" component={LockScreen} />
          </Stack.Group>
        ) : (
          // Main App Stack with Tabs and Detail Views
          <Stack.Group>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="PublicationDetail" component={PublicationDetailScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
