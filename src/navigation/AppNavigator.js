import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { navigationRef } from './navigationRef';
import { linking } from './linking';
import { getProfileTabBadge, subscribeToProfileTabBadge } from '../storage/profileTabBadge';

// Pantalla inicial: decide si ir al login, al bloqueo biométrico o a la app
import StartScreen from '../screens/StartScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';
import LockScreen from '../screens/auth/LockScreen';

// Main Tab Screens
import HomeScreen from '../screens/tabs/HomeScreen';
import PublishScreen from '../screens/tabs/PublishScreen';
import MyPublicationsScreen from '../screens/tabs/MyPublicationsScreen';
import ClaimsScreen from '../screens/tabs/ClaimsScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';

// Detail & Modal Screens
import PublicationDetailScreen from '../screens/publication/PublicationDetailScreen';
import EditPublicationScreen from '../screens/publication/EditPublicationScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';
import ResolvedHistoryScreen from '../screens/profile/ResolvedHistoryScreen';
import MyAlertsScreen from '../screens/profile/MyAlertsScreen';
import AlertResultsScreen from '../screens/profile/AlertResultsScreen';
import FollowedPublicationsScreen from '../screens/profile/FollowedPublicationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  // Indicador de novedades en la pestaña Perfil (seguidas y alertas)
  const [profileTabBadge, setProfileTabBadge] = useState(getProfileTabBadge());

  useEffect(() => {
    const unsubscribe = subscribeToProfileTabBadge(setProfileTabBadge);
    return unsubscribe;
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 4,
          height: 60,
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
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyPublicationsTab"
        component={MyPublicationsScreen}
        options={{
          title: 'Mis Publicaciones',
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
          tabBarBadge: profileTabBadge ? ' ' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#ef4444',
            minWidth: 8,
            height: 8,
            borderRadius: 8,
            marginLeft: 6,
            marginTop: 4,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Encabezado de las pantallas de autenticación (igual al que tenía la app)
const authHeaderOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: Colors.primary },
  headerTintColor: Colors.textOnPrimary,
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator initialRouteName="Start" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Start" component={StartScreen} />

        {/* Auth Stack (Clase 8 - React Navigation) */}
        <Stack.Group screenOptions={authHeaderOptions}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
          <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} options={{ title: 'Verificar email' }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar contraseña' }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Nueva contraseña' }} />
          <Stack.Screen name="NewPassword" component={NewPasswordScreen} options={{ title: 'Nueva contraseña' }} />
          <Stack.Screen name="Lock" component={LockScreen} options={{ headerShown: false }} />
        </Stack.Group>

        {/* Main App Stack with Tabs and Detail Views */}
        <Stack.Group>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="PublicationDetail" component={PublicationDetailScreen} />
          <Stack.Screen name="EditPublication" component={EditPublicationScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
          <Stack.Screen name="ResolvedHistory" component={ResolvedHistoryScreen} />
          <Stack.Screen name="MyAlerts" component={MyAlertsScreen} />
          <Stack.Screen name="AlertResults" component={AlertResultsScreen} />
          <Stack.Screen name="FollowedPublications" component={FollowedPublicationsScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
