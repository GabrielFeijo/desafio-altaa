import { AcceptInviteForm } from "@/components/invite/accept-invite-form";
import { Suspense } from "react";

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={<div className="text-center p-8">Carregando...</div>}>
            <AcceptInviteForm />
        </Suspense>
    );
}
