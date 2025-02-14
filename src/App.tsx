import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JSONFeed } from "./components/JSONFeed/JSONFeed";
import { SpotComponent } from "./components/Spot/SpotChart";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import styles from "./App.module.css";
import { HNIcon } from "./components/Icons/HNIcon";
import { YleIcon } from "./components/Icons/YleIcon";
import { ChartIcon } from "./components/Icons/ChartIcon";
import { useEffect, useState } from "react";
import { CurrentWeather } from "./components/Weather";

const queryClient = new QueryClient();

const tabs = [
  {
    id: "dashboard",
    label: <ChartIcon />,
  },
  {
    id: "hn",
    label: <HNIcon />,
  },
  {
    id: "yle",
    label: <YleIcon />,
  },
];
function App() {
  const [selectedTab, setSelectedTab] = useState(
    location.hash.slice(1) || "dashboard",
  );

  useEffect(() => {
    location.hash = selectedTab;
  }, [selectedTab]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.contentWrapper}>
        {selectedTab === "dashboard" && (
          <div className={styles.dashboard}>
            <CurrentWeather />
            <ParentSize>
              {({ width }) => (
                <SpotComponent width={width * 0.9} height={width / 3} />
              )}
            </ParentSize>
          </div>
        )}
        {selectedTab === "yle" && <JSONFeed source="yle" />}
        {selectedTab === "hn" && <JSONFeed source="hn" />}
        <div className={styles.floatingToggleBtnContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={tab.id === selectedTab ? styles.selected : ""}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </QueryClientProvider>
  );
}
export default App;
