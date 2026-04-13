"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import NavTabs from "@/components/NavTabs";
import StationPicker from "@/components/StationPicker";
import UnitToggle from "@/components/UnitToggle";
import CurrentConditions from "@/components/CurrentConditions";
import ForecastStrip from "@/components/ForecastStrip";
import HistoryView from "@/components/HistoryView";
import type { Station } from "@/lib/types";
import { useUnitPreference } from "@/hooks/useUnitPreference";

function findTempestDevice(station: Station) {
  return station.devices?.find((d) => d.device_type === "ST") ?? null;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Current");
  const [stationId, setStationId] = useState<number | null>(null);
  const [deviceId, setDeviceId] = useState<number | null>(null);
  const [elevationM, setElevationM] = useState<number | null>(null);
  const [deviceAglM, setDeviceAglM] = useState<number | null>(null);
  const { units, setUnits } = useUnitPreference();

  const handleStationSelect = useCallback((station: Station) => {
    const device = findTempestDevice(station);
    setDeviceId(device?.device_id ?? null);
    setDeviceAglM(device?.device_meta?.agl ?? null);
    setElevationM(station.station_meta?.elevation ?? null);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Header>
        <div className="flex items-center gap-2">
          <UnitToggle units={units} onChange={setUnits} />
          <StationPicker
            selectedStationId={stationId}
            onStationChange={setStationId}
            onStationSelect={handleStationSelect}
          />
        </div>
      </Header>
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {activeTab === "Current" && (
          <CurrentConditions stationId={stationId} units={units} />
        )}
        {activeTab === "Forecast" && (
          <ForecastStrip stationId={stationId} units={units} />
        )}
        {activeTab === "History" && (
          <HistoryView
            deviceId={deviceId}
            units={units}
            elevationM={elevationM}
            deviceAglM={deviceAglM}
          />
        )}
      </main>
    </div>
  );
}
