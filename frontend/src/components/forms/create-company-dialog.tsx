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
    FormDescription,
} from "@/components/ui/form";
import { createCompanyAction } from "@/lib/actions/company.actions";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

const createCompanySchema = z.object({
    name: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
    logo: z.url({ message: "Logo deve ser uma URL válida" }).optional().or(z.literal("")),
});

type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;

export function CreateCompanyDialog() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<CreateCompanyFormValues>({
        resolver: zodResolver(createCompanySchema),
        defaultValues: {
            name: "",
            logo: "",
        },
    });

    const onSubmit = async (data: CreateCompanyFormValues) => {
        const formData = new FormData();
        formData.append("name", data.name);
        if (data.logo) formData.append("logo", data.logo);

        startTransition(async () => {
            const result = await createCompanyAction(formData);

            if (result.success) {
                toast.success("Empresa criada com sucesso!");
                form.reset();
                setOpen(false);
                router.refresh();
                window.dispatchEvent(new CustomEvent('companyCreated'));
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Empresa
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Nova Empresa</DialogTitle>
                    <DialogDescription>
                        Crie uma nova empresa e convide sua equipe
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Empresa</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Minha Empresa Tech"
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
                            name="logo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo (URL)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://example.com/logo.png"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        URL da imagem do logotipo (opcional)
                                    </FormDescription>
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
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    "Criar Empresa"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}