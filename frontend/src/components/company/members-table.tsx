"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Member, Role } from "@/types";
import { formatDate, translateRole } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface MembersTableProps {
    members: Member[];
    companyId: string;
    userRole: Role;
    onMemberRemoved: () => void;
}

export function MembersTable({
    members,
    companyId,
    userRole,
    onMemberRemoved,
}: MembersTableProps) {
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

    const canRemoveMember = (memberRole: Role) => {
        if (userRole === "OWNER") return true;
        if (userRole === "ADMIN" && memberRole === "MEMBER") return true;
        return false;
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;

        setRemovingId(memberToRemove.id);
        try {
            console.log(companyId, memberToRemove.id);
            // Aqui você implementaria o endpoint de remover membro
            // await membershipService.removeMember(companyId, memberToRemove.id);
            toast.success("Membro removido com sucesso!");
            onMemberRemoved();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMessage =
                error.response?.data?.message ?? error.message ?? "Erro ao remover membro";
            toast.error(errorMessage);
        } finally {
            setRemovingId(null);
            setMemberToRemove(null);
        }
    };

    if (members.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Membros da Empresa</CardTitle>
                    <CardDescription>Nenhum membro encontrado</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Membros da Empresa</CardTitle>
                    <CardDescription>
                        {members.length} {members.length === 1 ? "membro" : "membros"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Papel</TableHead>
                                    <TableHead>Data de Ingresso</TableHead>
                                    {(userRole === "OWNER" || userRole === "ADMIN") && (
                                        <TableHead className="text-right">Ações</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Badge>
                                                {translateRole(member.role)}

                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(member.joinedAt)}</TableCell>
                                        {(userRole === "OWNER" || userRole === "ADMIN") && (
                                            <TableCell className="text-right">
                                                {canRemoveMember(member.role) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setMemberToRemove(member)}
                                                        disabled={removingId === member.id}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog
                open={!!memberToRemove}
                onOpenChange={(open) => !open && setMemberToRemove(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover membro</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover {memberToRemove?.name} da empresa?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveMember}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}