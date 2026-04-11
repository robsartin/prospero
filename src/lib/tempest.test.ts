import { buildUrl } from "./tempest";

describe("buildUrl", () => {
  it("constructs a Tempest API URL with token", () => {
    const url = buildUrl("/stations", "test-token");
    expect(url).toBe(
      "https://swd.weatherflow.com/swd/rest/stations?token=test-token"
    );
  });

  it("encodes special characters in the token", () => {
    const url = buildUrl("/stations", "token with spaces");
    expect(url).toContain("token=token+with+spaces");
  });
});
