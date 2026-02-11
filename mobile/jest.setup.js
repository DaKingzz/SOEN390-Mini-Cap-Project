require("dotenv").config();

const mockApiBaseUrl =
  process.env.TARGET === "phone"
    ? process.env.API_BASE_URL_PHONE
    : process.env.API_BASE_URL_EMULATOR;

jest.mock("expo-constants", () => ({
  expoConfig: { extra: { API_BASE_URL: mockApiBaseUrl } },
}));

jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return {
    Ionicons: View,
  };
});

jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
