import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StationPicker from "./StationPicker";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockStations = {
  stations: [
    { station_id: 1, name: "Home Station" },
    { station_id: 2, name: "Office Station" },
  ],
  status: { status_code: 0, status_message: "SUCCESS" },
};

describe("StationPicker", () => {
  const defaultProps = {
    onStationChange: jest.fn(),
    selectedStationId: null as number | null,
  };

  beforeEach(() => {
    mockFetch.mockReset();
    defaultProps.onStationChange = jest.fn();
  });

  it("shows loading state while fetching", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<StationPicker {...defaultProps} />);
    expect(screen.getByTestId("station-loading")).toBeInTheDocument();
  });

  it("renders a select with station options", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStations),
    });

    render(<StationPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Home Station")).toBeInTheDocument();
    });

    expect(screen.getByText("Office Station")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onStationChange when selection changes", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStations),
    });

    render(<StationPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Home Station")).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByRole("combobox"), "2");
    expect(defaultProps.onStationChange).toHaveBeenCalledWith(2);
  });

  it("shows error state on fetch failure", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    render(<StationPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("station-error")).toBeInTheDocument();
    });
  });

  it("auto-selects first station when none selected", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStations),
    });

    render(<StationPicker {...defaultProps} selectedStationId={null} />);

    await waitFor(() => {
      expect(defaultProps.onStationChange).toHaveBeenCalledWith(1);
    });
  });

  it("does not auto-select when a station is already selected", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStations),
    });

    render(<StationPicker {...defaultProps} selectedStationId={2} />);

    await waitFor(() => {
      expect(screen.getByText("Home Station")).toBeInTheDocument();
    });

    expect(defaultProps.onStationChange).not.toHaveBeenCalled();
  });

  it("fetches from /api/stations", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStations),
    });

    render(<StationPicker {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/stations",
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });
  });
});
