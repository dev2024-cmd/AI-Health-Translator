import React, { createContext, useContext, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
}

const AppContext = createContext<AppContextType>({
  language: 'hi',
  setLanguage: () => {},
  highContrast: false,
  setHighContrast: () => {},
  fontScale: 1.0,
  setFontScale: () => {},
});

export const useAppConfig = () => useContext(AppContext);

export default function RootLayout() {
  const router = useRouter();
  const [language, setLanguage] = useState<string>('hi');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<number>(1.0);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        highContrast,
        setHighContrast,
        fontScale,
        setFontScale,
      }}
    >
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: highContrast ? '#000000' : '#16a34a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '900',
            fontSize: 20,
          },
          headerRight: () => (
            <View style={styles.headerControls}>
              {/* Language Switcher */}
              <TouchableOpacity
                onPress={() => router.push('/language-select')}
                style={styles.headerBtn}
                accessibilityLabel="Change Language"
              >
                <Text style={styles.headerBtnText}>🌐 {language.toUpperCase()}</Text>
              </TouchableOpacity>

              {/* High Contrast Toggle */}
              <TouchableOpacity
                onPress={() => setHighContrast(!highContrast)}
                style={styles.headerBtn}
                accessibilityLabel="Toggle High Contrast Mode"
              >
                <Text style={styles.headerBtnText}>{highContrast ? '☀' : '◐'}</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'HealthTranslate',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="language-select"
          options={{
            title: 'Select Language (భాష / भाषा)',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="scan"
          options={{
            title: 'Scan Report',
          }}
        />
        <Stack.Screen
          name="report/[id]"
          options={{
            title: 'Report Result',
          }}
        />
        <Stack.Screen
          name="reports"
          options={{
            title: 'My Reports (Offline)',
          }}
        />
        <Stack.Screen
          name="caregiver"
          options={{
            title: 'Caregiver Settings',
          }}
        />
      </Stack>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  headerBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
