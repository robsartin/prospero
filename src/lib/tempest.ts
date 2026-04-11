const TEMPEST_BASE_URL = "https://swd.weatherflow.com/swd/rest";

export function buildUrl(path: string, token: string): string {
  const url = new URL(`${TEMPEST_BASE_URL}${path}`);
  url.searchParams.set("token", token);
  return url.toString();
}
