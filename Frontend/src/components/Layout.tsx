import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChatbotButton } from "./ChatbotButton";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 py-8 pb-16">
        <Outlet />
      </main>
      <Footer />
      {isAuthenticated && !isAdmin && <ChatbotButton />}
      <Toaster />
    </div>
  );
}
