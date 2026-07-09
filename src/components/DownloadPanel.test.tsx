import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DownloadPanel from "./DownloadPanel";

describe("DownloadPanel", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    global.URL.createObjectURL = jest.fn(() => "blob:x");
    global.URL.revokeObjectURL = jest.fn();
  });

  it("renders a checkbox per registry metric with rain checked", () => {
    render(<DownloadPanel deviceId={9} />);
    expect(screen.getByRole("checkbox", { name: /rain/i })).toBeChecked();
  });

  it("disables download when no device is selected", () => {
    render(<DownloadPanel deviceId={null} />);
    expect(screen.getByRole("button", { name: /download/i })).toBeDisabled();
  });

  it("requests the export URL with chosen params on download", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["date,Rain (mm)\n"], { type: "text/csv" }),
    });
    render(<DownloadPanel deviceId={9} tzOffsetMinutes={-420} />);

    await userEvent.type(screen.getByLabelText(/start/i), "2026-01-01");
    await userEvent.type(screen.getByLabelText(/end/i), "2026-01-31");
    await userEvent.click(screen.getByRole("button", { name: /download/i }));

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("/api/export?");
    expect(url).toContain("device_id=9");
    expect(url).toContain("metrics=rain");
    expect(url).toContain("units=metric");
    expect(url).toContain("tz_offset=-420");
    expect(url).toContain("format=csv");
  });

  it("shows the server error message when the request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "date range must not exceed 366 days" }),
    });
    render(<DownloadPanel deviceId={9} />);

    await userEvent.type(screen.getByLabelText(/start/i), "2020-01-01");
    await userEvent.type(screen.getByLabelText(/end/i), "2026-01-01");
    await userEvent.click(screen.getByRole("button", { name: /download/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/366 days/);
  });
});
