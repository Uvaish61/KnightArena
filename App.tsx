import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { AppNavigator } from './src/navigation/AppNavigator';
import { preloadSounds } from './src/audio/sounds';
import { colors } from './src/theme/theme';

enableScreens();
preloadSounds();

const navigationTheme = {
  dark: true,
  colors: {
    ...(DarkTheme.colors || DefaultTheme.colors),
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
    notification: colors.accent,
  },
  fonts: DarkTheme.fonts || DefaultTheme.fonts,
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <NavigationContainer theme={navigationTheme}>
            <AppNavigator />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
