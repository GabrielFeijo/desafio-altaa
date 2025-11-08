/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, User, X } from "lucide-react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useEffect } from "react";

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Perfil",
        href: "/profile",
        icon: User,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, close } = useSidebar();

    useEffect(() => {
        close();
    }, [pathname]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={close}
                    aria-hidden="true"
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r bg-background transition-transform duration-300 md:static md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-between border-b px-6">
                    <Link href="/dashboard" className=" items-center space-x-2 md:flex hidden">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">A</span>
                        </div>
                        <span className="font-bold text-xl">Altaa.ai</span>
                    </Link>

                    <button
                        onClick={close}
                        className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label="Fechar menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t p-4">
                    <p className="text-xs text-muted-foreground">
                        © 2025 Altaa.ai
                    </p>
                </div>
            </aside>
        </>
    );
}