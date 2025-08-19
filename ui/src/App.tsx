import DashboardPanel from "./components/DashboardPanel";
import CopilotPanel from "./components/CopilotPanel";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-2 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row h-full gap-4 md:gap-8 max-w-7xl mx-auto">
        {/* Left: Dashboard */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800 p-4 md:p-6 rounded-lg md:rounded-l-lg bg-zinc-900/60 shadow transition-all duration-200">
          <DashboardPanel />
        </div>
        {/* Right: Copilot */}
        <div
          className="w-full max-w-md flex flex-col p-4 md:p-6 rounded-lg md:rounded-r-lg bg-zinc-900/60 shadow transition-all duration-200"
          style={{ minWidth: 320 }}
        >
          <CopilotPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
