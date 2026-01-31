import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const BURGUNDY = "#800020";

export default function SearchPanel({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setQuery("");
      // focus after modal opens
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      {/* backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* panel */}
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Search buildings, rooms..."
          placeholderTextColor="#999"
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {/* empty white area for now */}
        <View style={styles.resultsArea}>
          <Text style={styles.hint}>Results will appear here</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: BURGUNDY,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  closeText: {
    color: BURGUNDY,
    fontWeight: "600",
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    fontSize: 15,
  },
  resultsArea: {
    flex: 1,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  hint: {
    color: "#999",
    marginTop: 8,
  },
});
