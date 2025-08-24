// src/pages/Landing.tsx

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900 text-center max-w-2xl">
        Cut RevOps grunt work without hiring.
      </h1>
      <ul className="mb-8 text-blue-800 text-lg space-y-2 max-w-lg">
        <li>• Automate reporting and data syncs</li>
        <li>• Unify metrics from all your tools</li>
        <li>• Launch in days, not months</li>
      </ul>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <a
          href="mailto:hello@henzelabs.com?subject=Start%2030-day%20pilot"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-center"
        >
          Start 30-day pilot
        </a>
        <a
          href="#pricing"
          className="px-6 py-3 bg-white text-blue-700 border border-blue-600 rounded-lg shadow hover:bg-blue-50 transition text-center"
        >
          See pricing
        </a>
      </div>
      <form
        className="flex flex-col md:flex-row gap-2 items-center justify-center"
        action="mailto:hello@henzelabs.com"
        method="GET"
        onSubmit={(e) => {
          // fallback: mailto
          const email = (e.target as any).email.value;
          window.location.href = `mailto:hello@henzelabs.com?subject=Demo%20Request&body=Email:%20${encodeURIComponent(
            email
          )}`;
          e.preventDefault();
        }}
      >
        <input
          type="email"
          name="email"
          required
          placeholder="Your email"
          className="rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Request info
        </button>
      </form>
    </div>
  );
}
