import { getConfig } from "./config";

describe("getConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns token and stationId when both env vars are set", () => {
    process.env.TEMPEST_API_TOKEN = "test-token";
    process.env.TEMPEST_STATION_ID = "12345";

    const config = getConfig();

    expect(config).toEqual({ token: "test-token", stationId: "12345" });
  });
});
