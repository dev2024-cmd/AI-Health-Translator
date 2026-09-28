import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CreateNewSheet } from '../components/CreateNewSheet';
import { useAppConfig } from '../_layout';

export default function TabLayout() {
  const router = useRouter();
  const { language, highContrast } = useAppConfig();
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            highContrast && styles.tabBarHighContrast,
          ],
          tabBarActiveTintColor: '#16a34a',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '800',
            marginTop: -4,
            marginBottom: 4,
          },
        }}
      >
        {/* Home Tab */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20 }}>{focused ? '🏠' : '🏚️'}</Text>
            ),
          }}
        />

        {/* Reports Tab */}
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20 }}>{focused ? '📑' : '📄'}</Text>
            ),
          }}
        />

        {/* Center + Action Button */}
        <Tabs.Screen
          name="create-placeholder"
          options={{
            title: '',
            tabBarButton: () => (
              <TouchableOpacity
                onPress={() => setSheetVisible(true)}
                activeOpacity={0.85}
                style={styles.centerBtnContainer}
              >
                <View style={[styles.centerBtn, highContrast && styles.centerBtnHighContrast]}>
                  <Text style={styles.centerBtnIcon}>+</Text>
                </View>
              </TouchableOpacity>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setSheetVisible(true);
            },
          }}
        />

        {/* Family Tab */}
        <Tabs.Screen
          name="family"
          options={{
            title: 'Family',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20 }}>{focused ? '👨‍👩‍👧' : '👥'}</Text>
            ),
          }}
        />

        {/* Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 20 }}>{focused ? '👤' : '⚙️'}</Text>
            ),
          }}
        />
      </Tabs>

      {/* Center + Bottom Sheet */}
      <CreateNewSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        highContrast={highContrast}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    paddingTop: 8,
  },
  tabBarHighContrast: {
    backgroundColor: '#000000',
    borderTopColor: '#334155',
  },
  centerBtnContainer: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  centerBtnHighContrast: {
    backgroundColor: '#22c55e',
    borderColor: '#000000',
  },
  centerBtnIcon: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '900',
    marginTop: -2,
  },
});
