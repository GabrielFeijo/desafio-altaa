"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import { AxiosError } from "axios";

const acceptInviteSchema = z
    .object({
        token: z.string(),
        email: z.email({ message: "Email inválido" }).optional(),
        password: z
            .string()
            .min(6, { message: "Senha deve ter no mínimo 6 caracteres" })
            .optional(),
        name: z
            .string()
            .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
            .optional(),
    })
    .refine(
        (data) => {
            if (data.email || data.password || data.name) {
                return data.email && data.password && data.name;
            }
            return true;
        },
        {
            message: "Preencha todos os campos para criar sua conta",
        }
    );

type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;

export function AcceptInviteForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(true);

    const form = useForm<AcceptInviteFormValues>({
        resolver: zodResolver(acceptInviteSchema),
        defaultValues: {
            token: searchParams.get("token") || "",
            email: "",
            password: "",
            name: "",
        },
    });

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            form.setValue("token", token);
        }
    }, [searchParams, form]);

    const onSubmit = async (data: AcceptInviteFormValues) => {
        setLoading(true);

        try {
            const response = await authService.acceptInvite(data);
            toast.success(response.message || "Convite aceito com sucesso!");
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMessage =
                error.response?.data?.message ??
                error.message ??
                "Erro ao aceitar convite";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        Aceitar Convite
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isNewUser
                            ? "Crie sua conta para aceitar o convite"
                            : "Entre com sua conta existente"}
                    </CardDescription>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            {isNewUser ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nome completo</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="João Silva"
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
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="seu@email.com"
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
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Senha</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        disabled={loading}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground">
                                    Você já tem uma conta? Faça login primeiro e depois aceite o
                                    convite através do link.
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Aceitando convite...
                                    </>
                                ) : (
                                    "Aceitar Convite"
                                )}
                            </Button>

                            {isNewUser ? (
                                <div className="text-sm text-center text-muted-foreground">
                                    Já tem uma conta?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setIsNewUser(false)}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Fazer login
                                    </button>
                                </div>
                            ) : (
                                <div className="text-sm text-center text-muted-foreground">
                                    Não tem uma conta?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setIsNewUser(true)}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Criar conta
                                    </button>
                                </div>
                            )}
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
