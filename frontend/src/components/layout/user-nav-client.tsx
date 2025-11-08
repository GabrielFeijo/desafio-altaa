"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getColorFromName, getInitials } from "@/lib/utils";
import { authService } from "@/services/auth.service";

interface UserData {
    id: string;
    name: string;
    email: string;
    activeCompanyId: string | null;
}

interface UserNavClientProps {
    user: UserData | null;
}

export function UserNavClient({ user }: UserNavClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleLogout = () => {
        startTransition(async () => {
            try {
                await authService.logout();
                router.push("/login");
                toast.success("Logout realizado com sucesso!");
            } catch {
                toast.error("Erro ao fazer logout");
            }
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Avatar className="h-10 w-10">
                            <AvatarFallback
                                className={`${user ? getColorFromName(user.name) : 'bg-primary'} text-white`}
                            >
                                {user ? getInitials(user.name) : "U"}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user?.name || "Usuário"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email || "usuario@email.com"}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    disabled={isPending}
                >
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={isPending}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Saindo...</span>
                        </>
                    ) : (
                        <>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}