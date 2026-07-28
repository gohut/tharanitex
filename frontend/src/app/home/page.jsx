import Navbar from "@/components/home/Navbar/Navbar";
import Hero from "@/components/home/Hero/Hero";

export default function HomePage() {
  return (
    <main className="bg-[#F8F2E8] min-h-screen">
      <Navbar />
      <Hero />
    </main>
  );
}