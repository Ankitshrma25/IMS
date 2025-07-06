// @components/header/index.tsx
"use client";

// Components
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Icons
import { LogOut } from "lucide-react";

// Utility
import Link from "next/link";
import { useRouter } from "next/navigation"; // Change this to next/navigation
import api from "@/lib/axios/axios.client"; // Change to client axios

// store
import { useUserStore } from "@/lib/store/useStore";

export const Header = () => {
  // Router 
  const router = useRouter();
  
  // Store
  const { resetName } = useUserStore();

  // Logout
  const logout = async () => {
    try {
      // Make a request to logout
      const res = await api.post("/api/logout"); // Change to POST method
      
      // If logout is successful, redirect to login
      if (res.status === 200) {
        resetName();
        router.push("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 bg-white dark:bg-[#1c1917]">
        <header className="z-10 flex h-14 w-full items-center justify-between px-4 shadow-md backdrop-blur-sm dark:bg-[#1c1917]">
          <div className="flex items-center justify-center gap-6">
            <SidebarTrigger className="cursor-pointer" />
            <Link
              href="/home"
              className="cursor-default text-xl font-semibold tracking-wide"
            >
              509 ABW
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={logout}
              className="flex cursor-pointer items-center gap-2 bg-red-500 hover:scale-105 hover:bg-red-600 active:scale-95"
            >
              <span className="flex items-center gap-1 font-semibold">
                Logout <LogOut />
              </span>
            </Button>
          </div>
        </header>
        <Separator className="z-10 h-1 dark:bg-white/50" />
      </div>
    </>
  );
};
