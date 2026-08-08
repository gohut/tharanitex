export default function LoadingScreen({ admin = false }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`flex min-h-[60vh] items-center justify-center ${admin ? "bg-green-950" : "bg-white"}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
        <span className="text-sm opacity-60">Loading...</span>
      </div>
    </div>
  );
}
