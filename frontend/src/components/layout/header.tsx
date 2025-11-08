import { Suspense } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "./user-nav-wrapper";
import UserNavSkeleton from "../skeleton/user-nav-skeleton";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6">
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>

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