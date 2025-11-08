
"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar-context";

export function SidebarToggle() {
    const { toggle } = useSidebar();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggle}
            aria-label="Abrir menu"
        >
            <Menu className="h-5 w-5" />
        </Button>
    );
}