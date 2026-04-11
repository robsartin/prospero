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

  it("throws when TEMPEST_API_TOKEN is missing", () => {
    delete process.env.TEMPEST_API_TOKEN;

    expect(() => getConfig()).toThrow(
      "TEMPEST_API_TOKEN environment variable is required"
    );
  });

  it("returns undefined stationId when TEMPEST_STATION_ID is not set", () => {
    process.env.TEMPEST_API_TOKEN = "test-token";
    delete process.env.TEMPEST_STATION_ID;

    const config = getConfig();

    expect(config).toEqual({ token: "test-token", stationId: undefined });
  });
});
