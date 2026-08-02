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
      <BottomNav />
    </PhoneFrame>
  );
}
