import Link from "next/link";
import { ScanLine } from "lucide-react";
import { PhoneFrame } from "@/components/shared/phone-frame";
import { BottomNav } from "@/components/shared/bottom-nav";

export default function KioskAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PhoneFrame>
      <div className="relative w-full h-full pb-[72px] overflow-y-auto">
        {children}
      </div>
      
      {/* Kiosk FAB - Placed slightly above the bottom nav */}
      <Link 
        href="/kiosk"
        className="absolute bottom-24 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-emerald)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Mở Kiosk"
      >
        <ScanLine className="h-6 w-6" />
      </Link>

      <BottomNav />
    </PhoneFrame>
  );
}
