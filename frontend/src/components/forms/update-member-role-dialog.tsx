"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { updateMemberRoleAction } from "@/lib/actions/company.actions";
import { Member, Role } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { translateRole } from "@/lib/utils";

interface UpdateMemberRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member;
    companyId: string;
}

export function UpdateMemberRoleDialog({
    open,
    onOpenChange,
    member,
    companyId,
}: UpdateMemberRoleDialogProps) {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<Role>(member.role);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        if (selectedRole === member.role) {
            toast.info("Papel não foi alterado");
            onOpenChange(false);
            return;
        }

        startTransition(async () => {
            const result = await updateMemberRoleAction(
                companyId,
                member.id,
                selectedRole
            );

            if (result.success) {
                toast.success("Papel atualizado com sucesso!");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Alterar Papel do Membro</DialogTitle>
                    <DialogDescription>
                        Atualize o papel de {member.name} na empresa
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Papel Atual</Label>
                        <p className="text-sm text-muted-foreground">
                            {translateRole(member.role)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Novo Papel</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={(value) => setSelectedRole(value as Role)}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={Role.MEMBER}>
                                    {translateRole(Role.MEMBER)}
                                </SelectItem>
                                <SelectItem value={Role.ADMIN}>
                                    {translateRole(Role.ADMIN)}
                                </SelectItem>
                                <SelectItem value={Role.OWNER}>
                                    {translateRole(Role.OWNER)}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending} className="mb-4 sm:mb-0">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Atualizando...
                            </>
                        ) : (
                            "Atualizar Papel"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}