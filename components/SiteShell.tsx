"use client";

import { usePathname } from "next/navigation";
import Nav from "./Nav";
import Footer from "./Footer";
import AgeGate from "./AgeGate";

export default function SiteShell({ children, retailerCompensation = false }: { children: React.ReactNode; retailerCompensation?: boolean }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <AgeGate />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer retailerCompensation={retailerCompensation} />
    </>
  );
}
