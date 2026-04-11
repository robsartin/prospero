"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import NavTabs from "@/components/NavTabs";
import StationPicker from "@/components/StationPicker";
import CurrentConditions from "@/components/CurrentConditions";
import ForecastStrip from "@/components/ForecastStrip";
import HistoryView from "@/components/HistoryView";
import type { Station } from "@/lib/types";

function findTempestDeviceId(station: Station): number | null {
  const stDevice = station.devices?.find((d) => d.device_type === "ST");
  return stDevice?.device_id ?? null;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Current");
  const [stationId, setStationId] = useState<number | null>(null);
  const [deviceId, setDeviceId] = useState<number | null>(null);

  const handleStationSelect = useCallback((station: Station) => {
    setDeviceId(findTempestDeviceId(station));
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Header>
        <StationPicker
          selectedStationId={stationId}
          onStationChange={setStationId}
          onStationSelect={handleStationSelect}
        />
      </Header>
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {activeTab === "Current" && (
          <CurrentConditions stationId={stationId} />
        )}
        {activeTab === "Forecast" && (
          <ForecastStrip stationId={stationId} />
        )}
        {activeTab === "History" && (
          <HistoryView deviceId={deviceId} />
        )}
      </main>
    </div>
  );
}
