import { Suspense } from "react";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav-wrapper";
import UserNavSkeleton from "../skeleton/user-nav-skeleton";
import { SidebarToggle } from "./sidebar-toggle";

export function Header() {
    return (
        <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6">
                <SidebarToggle />

                <div className="flex flex-1 items-center justify-end space-x-4">
                    <ThemeToggle />
                    <Suspense fallback={<UserNavSkeleton />}>
                        <UserNav />
                    </Suspense>
                </div>
            </div>
        </header>
    );
}