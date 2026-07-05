import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/sonner";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-8 pb-16">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
