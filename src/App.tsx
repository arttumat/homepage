import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JSONFeed } from "./components/JSONFeed/JSONFeed";
import { SpotComponent } from "./components/Spot/SpotChart";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import styles from "./App.module.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.contentWrapper}>
        <ParentSize>
          {({ width }) => (
            <SpotComponent width={width * 0.9} height={width / 3} />
          )}
        </ParentSize>
        <JSONFeed source="yle" />
        <JSONFeed source="hn" />
      </div>
    </QueryClientProvider>
  );
}
export default App;
