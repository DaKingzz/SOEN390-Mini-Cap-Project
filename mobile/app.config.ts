import "dotenv/config";

export default ({ config }: any) => {
  const target = process.env.TARGET ?? "emulator";

  const apiBaseUrl =
    target === "phone"
      ? process.env.API_BASE_URL_PHONE
      : process.env.API_BASE_URL_EMULATOR;

  // Google Maps key for Android, too me a while to get this working...
  const googleMapsAndroidKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        ...(config.android?.config ?? {}),
        googleMaps: {
          ...(config.android?.config?.googleMaps ?? {}),
          apiKey: googleMapsAndroidKey,
        },
      },
    },
    extra: {
      ...(config.extra ?? {}),
      API_BASE_URL: apiBaseUrl,
      TARGET: target,
    },
  };
};
