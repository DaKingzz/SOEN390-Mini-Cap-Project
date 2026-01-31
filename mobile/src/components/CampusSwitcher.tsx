import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";

const BURGUNDY = "#800020";

export default function CampusSwitcher({
  value,
  onChange,
}: {
  value: "SGW" | "LOYOLA";
  onChange: (v: "SGW" | "LOYOLA") => void;
}) {
  const [containerWidth, setContainerWidth] = useState(0);

  // Slider Effect
  const translateX = useRef(new Animated.Value(0)).current;

  const selectedIndex = value === "SGW" ? 0 : 1;

  const segmentWidth = useMemo(() => {
    return containerWidth > 0 ? containerWidth / 2 : 0;
  }, [containerWidth]);

  useEffect(() => {
    if (!segmentWidth) return;

    Animated.spring(translateX, {
      toValue: selectedIndex * segmentWidth,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
      mass: 0.7,
    }).start();
  }, [selectedIndex, segmentWidth, translateX]);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      {/* Sliding selector outline */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.selector,
          {
            width: segmentWidth ? segmentWidth - 8 : 0,
            transform: [{ translateX }],
          },
        ]}
      />

      <Pressable style={styles.item} onPress={() => onChange("SGW")}>
        <Text style={[styles.text, value === "SGW" && styles.textActive]}>SGW Campus</Text>
      </Pressable>

      <Pressable style={styles.item} onPress={() => onChange("LOYOLA")}>
        <Text style={[styles.text, value === "LOYOLA" && styles.textActive]}>Loyola Campus</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 300,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 999,
    padding: 4,
    position: "relative",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  selector: {
    position: "absolute",
    left: 4,
    top: 4,
    bottom: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: BURGUNDY,
    backgroundColor: "transparent",
  },
  item: {
    flex: 1,
    height: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 13,
    opacity: 0.7,
  },
  textActive: {
    opacity: 1,
    fontWeight: "600",
    color: BURGUNDY,
  },
});
