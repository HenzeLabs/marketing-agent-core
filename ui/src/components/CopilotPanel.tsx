import React from "react";

const CopilotPanel = () => {
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Greeting Card */}
      <div className="rounded-lg bg-zinc-800 p-6 mb-2 shadow hover:shadow-lg transition-shadow duration-200">
        <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">
          AI Copilot
        </h2>
        <p className="text-zinc-300">
          Hi Lauren! How can I help you with your marketing today?
        </p>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        <div className="self-start bg-zinc-700 rounded-lg px-4 py-2 max-w-[80%] shadow hover:scale-105 transition-transform duration-200">
          What are my top performing campaigns?
        </div>
        <div className="self-end bg-blue-600 rounded-lg px-4 py-2 max-w-[80%] shadow hover:scale-105 transition-transform duration-200">
          Your "Summer Sale" campaign has the highest engagement rate this week.
        </div>
        <div className="self-start bg-zinc-700 rounded-lg px-4 py-2 max-w-[80%] shadow hover:scale-105 transition-transform duration-200">
          Show me a chart of daily visits.
        </div>
        <div className="self-end bg-blue-600 rounded-lg px-4 py-2 max-w-[80%] shadow hover:scale-105 transition-transform duration-200">
          [Chart Placeholder]
        </div>
      </div>
      {/* Input Bar */}
      <form className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          placeholder="Type your message..."
          disabled
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50 transition-colors duration-200"
          disabled
        >
          Send
        </button>
      </form>
      {/* Placeholder for future chat interactivity */}
      <div className="mt-2 text-xs text-zinc-500 italic">
        [Future: chat input, actions, attachments]
      </div>
    </div>
  );
};

export default CopilotPanel;
