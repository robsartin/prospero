const TABS = ["Current", "Forecast", "History"] as const;

export interface NavTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex gap-1 px-4" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}
