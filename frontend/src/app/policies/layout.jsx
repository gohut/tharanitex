"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/home/Navbar/Navbar";
import { ChevronRight, FileText, Shield, Truck, RotateCcw, Mail, Phone } from "lucide-react";

const policiesList = [
  {
    name: "Terms & Conditions",
    href: "/policies/terms-of-service",
    icon: FileText,
  },
  {
    name: "Privacy Policy",
    href: "/policies/privacy-policy",
    icon: Shield,
  },
  {
    name: "Shipping Policy",
    href: "/policies/shipping-policy",
    icon: Truck,
  },
  {
    name: "Return & Refund Policy",
    href: "/policies/refund-policy",
    icon: RotateCcw,
  },
];

export default function PoliciesLayout({ children }) {
  const pathname = usePathname();

  const activePolicy = policiesList.find((p) => p.href === pathname) || policiesList[0];

  return (
    <>
      <Navbar />

      <main className="bg-[#F8F2E8] min-h-screen font-sans">
        {/* Page Header */}
        <section className="bg-white border-b border-[#E8DCC8]">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <p className="uppercase tracking-[0.3em] text-[#B58A45] text-sm font-medium">
              Customer Care
            </p>
            <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-cormorant text-[#5A1F2F] font-bold">
              {activePolicy.name}
            </h1>
            <p className="mt-4 text-[#8A8175] text-[15px] max-w-2xl leading-relaxed">
              Read our policies to understand our terms, conditions, shipping practices, and return guidelines for Tharani Textiles.
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <section className="max-w-7xl mx-auto px-6 py-5 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Link href="/home" className="hover:text-[#5A1F2F] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#C79A2B]" />
            <span className="text-gray-400">Policies</span>
            <ChevronRight size={14} className="text-[#C79A2B]" />
            <span className="text-[#5A1F2F] font-medium">{activePolicy.name}</span>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <aside className="bg-white border border-[#E8DCC8] rounded-xl p-3.5 lg:p-5 shadow-gold-sm sticky top-[78px] lg:top-24 z-30 lg:z-10">
              <h2 className="hidden lg:block text-[#5A1F2F] font-cormorant text-xl font-bold border-b border-[#E8DCC8] pb-3 mb-4">
                Other Policies
              </h2>
              <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none">
                {policiesList.map((policy) => {
                  const isActive = pathname === policy.href;
                  const Icon = policy.icon;
                  return (
                    <Link
                      key={policy.href}
                      href={policy.href}
                      className={`flex items-center gap-2 lg:gap-3 px-3.5 lg:px-4 py-2.5 lg:py-3 rounded-lg text-xs lg:text-sm font-semibold lg:font-medium transition-all duration-300 shrink-0 whitespace-nowrap ${
                        isActive
                          ? "bg-[#5A1F2F] text-white shadow-md font-bold"
                          : "text-[#2F2B27] hover:bg-[#F1E6D5] hover:text-[#5A1F2F]"
                      }`}
                    >
                      <Icon size={14} className={isActive ? "text-white" : "text-[#C79A2B]"} />
                      <span>{policy.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Sidebar Quick Contact */}
              <div className="hidden lg:block mt-8 pt-6 border-t border-[#E8DCC8] text-xs text-[#8A8175]">
                <p className="font-semibold text-[#2F2B27] mb-3">Need Assistance?</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-[#C79A2B]" />
                    <a href="mailto:info@tharanitextiles.com" className="hover:text-[#5A1F2F] transition-colors">
                      info@tharanitextiles.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-[#C79A2B]" />
                    <span>+91 XXXXX XXXXX</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Policy Content Card */}
            <article className="bg-white border border-[#E8DCC8] rounded-xl p-5 md:p-8 lg:p-12 shadow-gold-sm min-h-[500px]">
              {children}
            </article>

          </div>
        </section>
      </main>
    </>
  );
}
