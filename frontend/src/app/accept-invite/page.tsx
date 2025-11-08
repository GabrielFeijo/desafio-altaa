import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AcceptInviteForm } from "@/components/invite/accept-invite-form";
import { validateInviteToken } from "@/lib/actions/invite.actions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface AcceptInvitePageProps {
    searchParams: Promise<{ token?: string }>;
}

async function ValidateAndRenderForm({ token }: { token: string }) {
    const validation = await validateInviteToken(token);

    if (!validation.valid) {
        redirect('/login?error=invalid_invite');
    }

    return <AcceptInviteForm token={token} />;
}

function LoadingState() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                            <AlertCircle className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        Validando convite...
                    </CardTitle>
                    <CardDescription className="text-center">
                        Aguarde enquanto verificamos seu convite
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
    const params = await searchParams;
    const token = params.token;

    if (!token) {
        redirect('/login?error=no_token');
    }

    return (
        <Suspense fallback={<LoadingState />}>
            <ValidateAndRenderForm token={token} />
        </Suspense>
    );
}