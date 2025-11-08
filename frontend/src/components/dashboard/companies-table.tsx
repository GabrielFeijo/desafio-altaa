"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { CompaniesResponse, Company } from "@/types";
import { formatDate, translateRole, getRoleColor } from "@/lib/utils";
import { Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { selectCompanyAction } from "@/lib/actions/company.actions";
import { toast } from "sonner";
import api from "@/services/api";

export function CompaniesTable() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectingId, setSelectingId] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [meta, setMeta] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);

    const fetchCompanies = async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true);
            const response = await api.get<CompaniesResponse>(
                `/companies?page=${page}&limit=${limit}`
            );

            setCompanies(response.data.data || []);
            setMeta(response.data.meta);
        } catch (error) {
            console.error("Error fetching companies:", error);
            setCompanies([]);
            toast.error("Erro ao carregar empresas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies(1, 10);
    }, []);

    const handlePageChange = (newPage: number) => {
        fetchCompanies(newPage, meta.limit);
    };

    const handleSelectCompany = async (companyId: string) => {
        setSelectingId(companyId);

        startTransition(async () => {
            const result = await selectCompanyAction(companyId);

            if (result.success) {
                toast.success("Empresa selecionada com sucesso!");
                router.push(`/company/${companyId}`);
            } else {
                toast.error(result.message || "Erro ao selecionar empresa");
                setSelectingId(null);
            }
        });
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Minhas Empresas</CardTitle>
                    <CardDescription>Empresas que você faz parte</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (companies.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Minhas Empresas</CardTitle>
                    <CardDescription>Empresas que você faz parte</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[200px]">
                    <p className="text-muted-foreground mb-4">
                        Você ainda não faz parte de nenhuma empresa
                    </p>
                </CardContent>
            </Card>
        );
    }

    const currentPage = meta?.page || 1;
    const totalPages = meta?.totalPages || 1;
    const total = meta?.total || companies.length;
    const limit = meta?.limit || 10;
    const startItem = ((currentPage - 1) * limit) + 1;
    const endItem = Math.min(currentPage * limit, total);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Minhas Empresas</CardTitle>
                <CardDescription>
                    {total} {total === 1 ? "empresa" : "empresas"} encontrada(s)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Papel</TableHead>
                                <TableHead>Data de Ingresso</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell className="font-medium">{company.name}</TableCell>
                                    <TableCell>
                                        <Badge className={getRoleColor(company.role)}>
                                            {translateRole(company.role)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {company.joinedAt ? formatDate(company.joinedAt) : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSelectCompany(company.id)}
                                            disabled={isPending && selectingId === company.id}
                                        >
                                            {isPending && selectingId === company.id ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Selecionando...
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Visualizar
                                                </>
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {startItem} a {endItem} de {total} {total === 1 ? "empresa" : "empresas"}
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground mr-2">
                                Página {currentPage} de {totalPages}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                title="Primeira página"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                title="Página anterior"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                title="Próxima página"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                title="Última página"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}