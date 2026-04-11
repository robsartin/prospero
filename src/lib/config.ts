export interface Config {
  token: string;
  stationId?: string;
}

export function getConfig(): Config {
  const token = process.env.TEMPEST_API_TOKEN;
  if (!token) {
    throw new Error("TEMPEST_API_TOKEN environment variable is required");
  }
  return {
    token,
    stationId: process.env.TEMPEST_STATION_ID || undefined,
  };
}
