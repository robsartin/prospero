"use client";

import { useCallback, useEffect, useState } from "react";
import TimeRangeSelector from "./TimeRangeSelector";
import HistoryChart, { type HistoryDataPoint } from "./HistoryChart";
import RainChart from "./RainChart";
import LightningChart from "./LightningChart";
import IlluminanceChart from "./IlluminanceChart";
import BatteryChart from "./BatteryChart";
import { voltageToPercent } from "@/lib/battery";
import { downsampleObs } from "@/lib/downsample";
import HistorySkeleton from "./HistorySkeleton";
import { heatIndexC, windChillC, wetBulbC } from "@/lib/comfortMetrics";
import { seaLevelPressureMb, barometricPressureMb } from "@/lib/pressureDerivations";
import { MetricUnitStrategy, type UnitStrategy } from "@/lib/units";
import { tempDomain, pressureDomain, zeroBasedDomain } from "@/lib/chartDomain";
import { getTimeRange, chunkTimeRange, type TimeRange } from "@/lib/timeRanges";
import type { TransformedObservation } from "@/lib/transforms";

interface HistoryViewProps {
  deviceId: number | null;
  units?: UnitStrategy;
  elevationM?: number | null;
  deviceAglM?: number | null;
}

function formatTime(epoch: number, range: TimeRange): string {
  const date = new Date(epoch * 1000);
  if (range === "today") {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "week" || range === "last-month") {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  if (range === "month") {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString([], { month: "short", year: "2-digit" });
}

function toTempSeriesData(
  obs: TransformedObservation[],
  range: TimeRange,
  convertTemp: (v: number) => number
): HistoryDataPoint[] {
  return obs
    .filter((o) => o.airTemperature != null)
    .map((o) => {
      const t = o.airTemperature as number;
      const rh = o.relativeHumidity;
      const w = o.windAvg;
      const hi = heatIndexC(t, rh);
      const wc = windChillC(t, w);
      const wb = wetBulbC(t, rh);
      return {
        time: formatTime(o.timestamp, range),
        value: convertTemp(t),
        heatIndex: hi != null ? convertTemp(hi) : null,
        windChill: wc != null ? convertTemp(wc) : null,
        wetBulb: wb != null ? convertTemp(wb) : null,
      };
    });
}

function toPressureSeriesData(
  obs: TransformedObservation[],
  range: TimeRange,
  convertPressure: (v: number) => number,
  elevationM: number | null,
  deviceAglM: number | null
): HistoryDataPoint[] {
  return obs
    .filter((o) => o.stationPressure != null)
    .map((o) => {
      const p = o.stationPressure as number;
      const t = o.airTemperature;
      const sea = seaLevelPressureMb(p, elevationM, t);
      const baro = barometricPressureMb(p, deviceAglM, t);
      return {
        time: formatTime(o.timestamp, range),
        value: convertPressure(p),
        barometric: baro != null ? convertPressure(baro) : null,
        seaLevel: sea != null ? convertPressure(sea) : null,
      };
    });
}

function toChartData(
  obs: TransformedObservation[],
  field: keyof TransformedObservation,
  range: TimeRange,
  convert: (v: number) => number = (v) => v,
  directionField?: keyof TransformedObservation,
  precipTypeField?: keyof TransformedObservation
): HistoryDataPoint[] {
  return obs
    .filter((o) => o[field] != null)
    .map((o) => ({
      time: formatTime(o.timestamp, range),
      value: convert(o[field] as number),
      direction: directionField ? (o[directionField] as number | null) : undefined,
      precipType: precipTypeField ? (o[precipTypeField] as number | null) : undefined,
    }));
}

async function fetchChunk(
  deviceId: number,
  start: number,
  end: number,
  signal: AbortSignal
): Promise<TransformedObservation[]> {
  const res = await fetch(
    `/api/history?device_id=${deviceId}&time_start=${start}&time_end=${end}`,
    { signal }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const DEFAULT_UNITS = new MetricUnitStrategy();
const TARGET_BUCKETS = 500;

export default function HistoryView({
  deviceId,
  units = DEFAULT_UNITS,
  elevationM = null,
  deviceAglM = null,
}: HistoryViewProps) {
  const [range, setRange] = useState<TimeRange>("today");
  const [obs, setObs] = useState<TransformedObservation[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (id: number, timeRange: TimeRange, signal: AbortSignal) => {
      setPending(true);
      try {
        const [start, end] = getTimeRange(timeRange);
        const chunks = chunkTimeRange(start, end);

        const results = await Promise.all(
          chunks.map(([s, e]) => fetchChunk(id, s, e, signal))
        );

        if (!signal.aborted) {
          setObs(downsampleObs(results.flat(), TARGET_BUCKETS));
          setError(null);
        }
      } catch (err) {
        if (!signal.aborted && err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!signal.aborted) {
          setPending(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!deviceId) return;
    const controller = new AbortController();
    load(deviceId, range, controller.signal);
    return () => controller.abort();
  }, [deviceId, range, load]);

  if (!deviceId) {
    return <p className="text-zinc-500">Select a station to view history.</p>;
  }

  const tempData = toTempSeriesData(obs, range, units.temp);
  const pressureData = toPressureSeriesData(obs, range, units.pressure, elevationM, deviceAglM);
  const windData = toChartData(obs, "windAvg", range, units.wind, "windDirection");
  const humidityData = toChartData(obs, "relativeHumidity", range);
  const rainData = toChartData(obs, "rainAccumulated", range, units.rain, undefined, "precipType");
  const lightningData = toChartData(obs, "lightningStrikeCount", range);
  const illuminanceData = toChartData(obs, "illuminance", range);
  const batteryData = toChartData(obs, "battery", range, (v) => voltageToPercent(v) ?? 0);

  return (
    <div className="space-y-6">
      <TimeRangeSelector selected={range} onChange={setRange} />

      {pending && <HistorySkeleton />}
      {error && <p data-testid="error" className="text-red-500">Error: {error}</p>}

      {!pending && !error && (
        <div className="space-y-8">
          <HistoryChart
            data={tempData}
            label="Temperature"
            unit={units.labels.temp}
            precision={0}
            domain={tempDomain(tempData)}
            series={[
              { dataKey: "value", label: "Air", color: "#ef4444" },
              { dataKey: "heatIndex", label: "Heat index", color: "#f97316" },
              { dataKey: "windChill", label: "Wind chill", color: "#0ea5e9" },
              { dataKey: "wetBulb", label: "Wet bulb", color: "#8b5cf6" },
            ]}
          />
          <HistoryChart
            data={pressureData}
            label="Pressure"
            unit={units.labels.pressure}
            precision={1}
            domain={pressureDomain(pressureData)}
            series={[
              { dataKey: "value", label: "Station", color: "#3b82f6" },
              { dataKey: "barometric", label: "Barometric", color: "#14b8a6" },
              { dataKey: "seaLevel", label: "Sea level", color: "#a855f7" },
            ]}
          />
          <HistoryChart
            data={windData}
            label="Wind"
            unit={units.labels.wind}
            color="#10b981"
            precision={1}
            showWindArrows
            domain={zeroBasedDomain(windData)}
          />
          <HistoryChart
            data={humidityData}
            label="Humidity"
            unit="%"
            color="#8b5cf6"
            precision={0}
            domain={zeroBasedDomain(humidityData)}
          />
          <RainChart
            data={rainData}
            unit={units.labels.rain}
            precision={2}
            domain={zeroBasedDomain(rainData)}
          />
          <LightningChart
            data={lightningData}
            domain={zeroBasedDomain(lightningData)}
          />
          <IlluminanceChart
            data={illuminanceData}
            domain={zeroBasedDomain(illuminanceData)}
          />
          <BatteryChart data={batteryData} />
        </div>
      )}
    </div>
  );
}
