"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import { AxiosError } from "axios";

const signupSchema = z
    .object({
        name: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
        email: z.email({ message: "Email inválido" }),
        password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

type SignUpFormValues = z.infer<typeof signupSchema>;

export default function SignUpPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: SignUpFormValues) => {
        setLoading(true);

        try {
            const response = await authService.signup({
                name: data.name,
                email: data.email,
                password: data.password,
            });
            toast.success(response.message || "Conta criada com sucesso!");
            router.push("/dashboard");
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMessage =
                error.response?.data?.message ?? error.message ?? "Erro ao criar conta";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Criar conta
                    </CardTitle>
                    <CardDescription className="text-center">
                        Preencha os dados abaixo para criar sua conta
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
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
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar senha</FormLabel>
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
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando conta...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Criar conta
                                    </>
                                )}
                            </Button>
                            <div className="text-sm text-center text-muted-foreground">
                                Já tem uma conta?{" "}
                                <Link
                                    href="/login"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Fazer login
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}