"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removeMemberAction } from "@/lib/actions/company.actions";
import { Member } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RemoveMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
    companyId: string;
}

export function RemoveMemberDialog({
    open,
    onOpenChange,
    member,
    companyId,
}: RemoveMemberDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleRemove = () => {
        startTransition(async () => {
            const result = await removeMemberAction(companyId, member.id);

            if (result.success) {
                toast.success("Membro removido com sucesso!");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remover membro</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja remover <strong>{member.name}</strong> da empresa?
                        Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleRemove}
                        disabled={isPending}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removendo...
                            </>
                        ) : (
                            "Remover"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}