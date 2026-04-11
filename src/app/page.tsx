"use client";

import { useState } from "react";
import Header from "@/components/Header";
import NavTabs from "@/components/NavTabs";
import StationPicker from "@/components/StationPicker";
import CurrentConditions from "@/components/CurrentConditions";
import ForecastStrip from "@/components/ForecastStrip";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Current");
  const [stationId, setStationId] = useState<number | null>(null);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Header>
        <StationPicker
          selectedStationId={stationId}
          onStationChange={setStationId}
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
          <p className="text-zinc-500">History coming soon.</p>
        )}
      </main>
    </div>
  );
}
