"use client";

import { useState, useEffect, useTransition } from "react";
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
    FormDescription,
} from "@/components/ui/form";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { acceptInviteAction } from "@/lib/actions/invite.actions";
import { toast } from "sonner";
import { CheckCircle, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

const newUserSchema = z
    .object({
        token: z.string().min(1, { message: "Token é obrigatório" }),
        name: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
        email: z.email({ message: "Email inválido" }),
        password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
        confirmPassword: z.string().min(6, { message: "Confirme sua senha" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

const existingUserSchema = z.object({
    token: z.string().min(1, { message: "Token é obrigatório" }),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;
type ExistingUserFormValues = z.infer<typeof existingUserSchema>;

export function AcceptInviteForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isNewUser, setIsNewUser] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const newUserForm = useForm<NewUserFormValues>({
        resolver: zodResolver(newUserSchema),
        defaultValues: {
            token: searchParams.get("token") || "",
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const existingUserForm = useForm<ExistingUserFormValues>({
        resolver: zodResolver(existingUserSchema),
        defaultValues: {
            token: searchParams.get("token") || "",
        },
    });

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            newUserForm.setValue("token", token);
            existingUserForm.setValue("token", token);
        }
    }, [searchParams, newUserForm, existingUserForm]);

    const onSubmitNewUser = async (data: NewUserFormValues) => {
        const formData = new FormData();
        formData.append("token", data.token);
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("isNewUser", "true");

        startTransition(async () => {
            const result = await acceptInviteAction(formData);

            if (result.success) {
                toast.success(result.message);
                router.push("/dashboard");
            } else {
                toast.error(result.message);
            }
        });
    };

    const onSubmitExistingUser = async (data: ExistingUserFormValues) => {
        const formData = new FormData();
        formData.append("token", data.token);
        formData.append("isNewUser", "false");

        startTransition(async () => {
            const result = await acceptInviteAction(formData);

            if (result.success) {
                toast.success(result.message);
                if (result.company) {
                    router.push(`/company/${result.company.id}`);
                } else {
                    router.push("/dashboard");
                }
            } else {
                toast.error(result.message);
            }
        });
    };

    const toggleUserType = () => {
        setIsNewUser(!isNewUser);
        newUserForm.reset({
            token: searchParams.get("token") || "",
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        });
        existingUserForm.reset({
            token: searchParams.get("token") || "",
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
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

                {isNewUser ? (
                    <Form {...newUserForm}>
                        <form onSubmit={newUserForm.handleSubmit(onSubmitNewUser)}>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Novo Usuário</AlertTitle>
                                    <AlertDescription>
                                        Preencha os dados abaixo para criar sua conta e aceitar o convite.
                                    </AlertDescription>
                                </Alert>

                                <FormField
                                    control={newUserForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome completo *</FormLabel>
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
                                    control={newUserForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    disabled={isPending}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Use o mesmo email do convite
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={newUserForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Senha *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        disabled={isPending}
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        disabled={isPending}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Mínimo de 6 caracteres
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={newUserForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmar Senha *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        disabled={isPending}
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        disabled={isPending}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Digite a mesma senha novamente
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4">
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Criando conta...
                                        </>
                                    ) : (
                                        "Criar Conta e Aceitar Convite"
                                    )}
                                </Button>

                                <div className="text-sm text-center text-muted-foreground">
                                    Já tem uma conta?{" "}
                                    <button
                                        type="button"
                                        onClick={toggleUserType}
                                        className="text-primary hover:underline font-medium"
                                        disabled={isPending}
                                    >
                                        Fazer login
                                    </button>
                                </div>
                            </CardFooter>
                        </form>
                    </Form>
                ) : (
                    <Form {...existingUserForm}>
                        <form onSubmit={existingUserForm.handleSubmit(onSubmitExistingUser)}>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Usuário Existente</AlertTitle>
                                    <AlertDescription>
                                        Você precisa estar logado para aceitar o convite.
                                        Faça login primeiro e depois acesse este link novamente.
                                    </AlertDescription>
                                </Alert>

                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Se você já está logado, clique no botão abaixo para aceitar o convite.
                                    </p>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4">
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Aceitando convite...
                                        </>
                                    ) : (
                                        "Aceitar Convite"
                                    )}
                                </Button>

                                <div className="text-sm text-center text-muted-foreground">
                                    Não tem uma conta?{" "}
                                    <button
                                        type="button"
                                        onClick={toggleUserType}
                                        className="text-primary hover:underline font-medium"
                                        disabled={isPending}
                                    >
                                        Criar conta
                                    </button>
                                </div>
                            </CardFooter>
                        </form>
                    </Form>
                )}
            </Card>
        </div>
    );
}