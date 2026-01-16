import "dotenv/config";

export default ({ config }: any) => {
  const target = process.env.TARGET ?? "emulator";

  const apiBaseUrl =
    target === "phone"
      ? process.env.API_BASE_URL_PHONE
      : process.env.API_BASE_URL_EMULATOR;

  return {
    ...config, // keeps the stuff from app.json thanks to npm install dotenv, this file won't override app.json but adds on it
    extra: {
      ...(config.extra ?? {}),
      API_BASE_URL: apiBaseUrl,
      TARGET: target,
    },
  };
};
