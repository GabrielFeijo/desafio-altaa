import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserProfile } from "@/lib/actions/user.actions";
import { ProfileForm } from "@/components/forms/profile-form";
import { PasswordForm } from "@/components/forms/password-form";
import ProfileSkeleton from "@/components/skeleton/profile-skeleton";
import { getInitials } from "@/lib/utils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ProfileContent() {
    const result = await getUserProfile();

    if (!result.success || !result.data) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Erro ao carregar perfil</p>
            </div>
        );
    }

    const user = result.data;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <p className="text-xl text-primary">
                                {user ? getInitials(user.name) : "U"}
                            </p>
                        </div>
                        <div>
                            <CardTitle>{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                        Atualize suas informações de perfil
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm user={user} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>
                        Mantenha sua conta segura atualizando sua senha regularmente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
                <p className="text-muted-foreground">
                    Gerencie suas informações pessoais e configurações
                </p>
            </div>

            <Separator />

            <Suspense fallback={<ProfileSkeleton />}>
                <ProfileContent />
            </Suspense>
        </div>
    );
}