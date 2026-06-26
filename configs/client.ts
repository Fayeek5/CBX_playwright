export const client = {
  baseUrl: process.env.BASE_URL!,
  username: process.env.CBX_USERNAME!,
  password: process.env.CBX_PASSWORD!,
  models: (process.env.MODELS || "")
    .split(",")
    .map(m => m.trim())
    .filter(Boolean),
};
