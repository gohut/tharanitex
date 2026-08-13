import { ProductGridSkeleton } from "../../components/ui/PageSkeleton";
export default function Loading() {
  return <main className="min-h-screen bg-white p-6"><div className="mx-auto max-w-7xl space-y-8"><div className="space-y-3"><div className="h-8 w-48 animate-pulse rounded-lg bg-green-900/70" /><div className="h-4 w-72 animate-pulse rounded-lg bg-green-900/70" /></div><ProductGridSkeleton /></div></main>;
}
