"use client";

import { useState } from "react";
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
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Company } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";

const editCompanySchema = z.object({
    name: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
    logo: z.url({ message: "Logo deve ser uma URL válida" }).optional().or(z.literal("")),
});

type EditCompanyFormValues = z.infer<typeof editCompanySchema>;

interface EditCompanyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    company: Company;
    onSuccess: () => void;
}

export function EditCompanyDialog({
    open,
    onOpenChange,
    company,
    onSuccess,
}: EditCompanyDialogProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<EditCompanyFormValues>({
        resolver: zodResolver(editCompanySchema),
        defaultValues: {
            name: company.name,
            logo: company.logo || "",
        },
    });

    const onSubmit = async (data: EditCompanyFormValues) => {
        setLoading(true);

        try {
            console.log(data);
            // Aqui você implementaria o endpoint de editar empresa
            // await companyService.update(company.id, data);
            toast.success("Empresa atualizada com sucesso!");
            onSuccess();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMessage =
                error.response?.data?.message ?? error.message ?? "Erro ao atualizar empresa";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Empresa</DialogTitle>
                    <DialogDescription>
                        Atualize as informações da empresa
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
                                            placeholder="Minha Empresa"
                                            disabled={loading}
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
                                            disabled={loading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    "Salvar Alterações"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}