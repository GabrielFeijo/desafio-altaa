"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { updateUserProfileAction } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { User } from "@/types";

const profileSchema = z.object({
    name: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
    email: z.email({ message: "Email inválido" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
        },
    });

    const onSubmit = async (data: ProfileFormValues) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);

        startTransition(async () => {
            const result = await updateUserProfileAction(formData);

            if (result.success) {
                toast.success("Perfil atualizado com sucesso!");
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="João Silva"
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
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="seu@email.com"
                                    disabled={true}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        "Salvar Alterações"
                    )}
                </Button>
            </form>
        </Form>
    );
}