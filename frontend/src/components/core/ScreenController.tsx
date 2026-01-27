import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import React, { useEffect } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  View,
  ViewStyle,
} from "react-native";
import { useKeyboardController } from "react-native-keyboard-controller";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean; // optional!
  style?: ViewStyle;
  noPadding?: boolean;
  dismissKeyboardOnPress?: boolean;
}

export default function ScreenController({
  children,
  style,
  scroll = true,
  noPadding = false,
  dismissKeyboardOnPress = true,
}: ScreenProps) {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  // smooth keyboard tracking
  useKeyboardController();

  const keyboardHeight = useSharedValue(0);

  useEffect(() => {
    const subShow = Keyboard.addListener("keyboardWillShow", () => {
      keyboardHeight.value = withTiming(100, {
        duration: 200,
      });
    });

    const subHide = Keyboard.addListener("keyboardWillHide", () => {
      keyboardHeight.value = withTiming(0, { duration: 250 });
    });

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            keyboardHeight.value,
            [0, keyboardHeight.value],
            [0, -keyboardHeight.value],
            "clamp"
          ),
        },
      ],
    };
  });

  const Container = scroll ? ScrollView : View;
  const containerProps = scroll
    ? {
        contentContainerStyle: { flexGrow: 1 },
        keyboardShouldPersistTaps: "handled" as const,
        nestedScrollEnabled: true,
        scrollEnabled: true,
        showsVerticalScrollIndicator: false,
      }
    : {};

  const Wrapper: React.ElementType = dismissKeyboardOnPress ? Pressable : View;
  const wrapperProps = dismissKeyboardOnPress
    ? { onPress: Keyboard.dismiss, accessible: false }
    : {};

  return (
    <SafeAreaView
      style={[{ flex: 1 }, styles.screen, noPadding ? { padding: 0 } : null]}
    >
      <Wrapper style={{ flex: 1 }} {...wrapperProps}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <Container style={[{ flex: 1 }, style]} {...containerProps}>
            {children}
          </Container>
        </Animated.View>
      </Wrapper>
    </SafeAreaView>
  );
}
