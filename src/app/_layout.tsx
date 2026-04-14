import AppProvider from '@/context/app.context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import 'react-native-reanimated';


import VoiceAssistantOverlay from '@/components/voice/voice.assistant.overlay';
import VoiceAssistantManager from '@/components/voice/voice.assistent.manager';
import { UIProvider } from '@/context/ui.context';
import { AIProvider } from '@/context/voice.context';
import * as SplashScreen from 'expo-splash-screen';


SplashScreen.preventAutoHideAsync();
export const unstable_settings = {
  anchor: '(tabs)',
};
console.log("🟢 _layout.tsx LOADED"); // <--- dòng này sẽ in ra ngay khi Layout mount
export default function RootLayout() {
  const colorScheme = useColorScheme();
  console.log("🟢 RootLayout() rendered"); // <--- 
  // 🟢 Bảo hiểm: nếu SplashScreen không được hide sau 8s thì tự ẩn để tránh treo
  // useEffect(() => {
  //   console.log("🟢 RootLayout useEffect() fired");
  //   const timer = setTimeout(() => SplashScreen.hideAsync(), 8000);
  //   return () => clearTimeout(timer);
  // }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppProvider>
          <PaperProvider>
            <UIProvider>
              <AIProvider>
                <VoiceAssistantManager />
                <VoiceAssistantOverlay />

                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)/verify" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)/forgot.password" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)/reset.password" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)/location.loading" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(stack)" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
              </AIProvider>
            </UIProvider>
          </PaperProvider>
        </AppProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
