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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdateMemberRoleDialog } from "@/components/forms/update-member-role-dialog";
import { Member, Role } from "@/types";
import { formatDate, translateRole, getRoleColor } from "@/lib/utils";
import { MoreVertical, Trash2, Shield } from "lucide-react";
import { RemoveMemberDialog } from "./remove-member-dialog";

interface MembersTableServerProps {
    members: Member[];
    companyId: string;
    userRole: Role;
}

export function MembersTableServer({
    members,
    companyId,
    userRole,
}: MembersTableServerProps) {
    const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
    const [memberToUpdate, setMemberToUpdate] = useState<Member | null>(null);

    const canRemoveMember = (memberRole: Role) => {
        if (userRole === "OWNER") return true;
        if (userRole === "ADMIN" && memberRole === "MEMBER") return true;
        return false;
    };

    const canUpdateRole = (memberRole: Role) => {
        if (userRole === "OWNER") return true;
        if (userRole === "ADMIN" && memberRole === "MEMBER") return true;
        return false;
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
                                            <Badge className={getRoleColor(member.role)}>
                                                {translateRole(member.role)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(member.joinedAt)}</TableCell>
                                        {(userRole === "OWNER" || userRole === "ADMIN") && (
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {canUpdateRole(member.role) && (
                                                            <DropdownMenuItem
                                                                onClick={() => setMemberToUpdate(member)}
                                                            >
                                                                <Shield className="mr-2 h-4 w-4" />
                                                                Alterar Papel
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canRemoveMember(member.role) && (
                                                            <DropdownMenuItem
                                                                onClick={() => setMemberToRemove(member)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Remover
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {memberToRemove && (
                <RemoveMemberDialog
                    open={!!memberToRemove}
                    onOpenChange={(open) => !open && setMemberToRemove(null)}
                    member={memberToRemove}
                    companyId={companyId}
                />
            )}

            {memberToUpdate && (
                <UpdateMemberRoleDialog
                    open={!!memberToUpdate}
                    onOpenChange={(open) => !open && setMemberToUpdate(null)}
                    member={memberToUpdate}
                    companyId={companyId}
                />
            )}
        </>
    );
}