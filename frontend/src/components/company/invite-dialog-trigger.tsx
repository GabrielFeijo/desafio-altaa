"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { inviteMemberAction } from "@/lib/actions/company.actions";
import { Role } from "@/types";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

const inviteSchema = z.object({
    email: z.email({ message: "Email inválido" }),
    role: z.enum(Role),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteDialogTrigger({ companyId }: { companyId: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: "",
            role: Role.MEMBER,
        },
    });

    const onSubmit = async (data: InviteFormValues) => {
        startTransition(async () => {
            try {
                const result = await inviteMemberAction(companyId, data.email, data.role);

                if (!result.success) {
                    toast.error(result.message);
                    return;
                }

                const baseURL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
                const inviteUrl = `${baseURL}/accept-invite/?token=${result.data.invite.token}`;

                toast.success("Convite enviado com sucesso!");

                const copied = await copyToClipboard(inviteUrl);

                if (copied) {
                    toast.info(
                        `Link copiado para a área de transferência!\n\n${inviteUrl}`,
                        { duration: 2000 }
                    );
                }

                if (!copied) {
                    const shared = await shareUrl(inviteUrl);

                    if (!shared) {
                        toast.info(`📋 Link do convite:\n\n${inviteUrl}`, { duration: 4000 });
                    }
                }

                form.reset();
                setOpen(false);
                router.refresh();
            } catch {
                toast.error("Erro inesperado. Tente novamente.");
            }
        });
    };

    async function copyToClipboard(text: string): Promise<boolean> {
        if (!navigator?.clipboard?.writeText) {
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            return false;
        }
    }

    async function shareUrl(url: string): Promise<boolean> {
        if (!navigator?.share) {
            return false;
        }

        try {
            await navigator.share({
                title: "Convite para empresa",
                text: "Você foi convidado. Acesse o link:",
                url: url,
            });
            return true;
        } catch {
            return false;
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Convidar Membro
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Convidar Membro</DialogTitle>
                    <DialogDescription>
                        Envie um convite para adicionar um novo membro à empresa
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="usuario@example.com"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Papel</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um papel" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={Role.MEMBER}>Membro</SelectItem>
                                            <SelectItem value={Role.ADMIN}>Administrador</SelectItem>
                                            <SelectItem value={Role.OWNER}>Proprietário</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending} className="mb-4 sm:mb-0">
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar Convite"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}