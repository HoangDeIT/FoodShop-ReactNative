import 'react-native-gesture-handler';
import 'react-native-reanimated';
import AppProvider from '@/context/app.context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";





export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppProvider>
          <PaperProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/verify" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/forgot.password" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/reset.password" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(stack)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </PaperProvider>
        </AppProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
