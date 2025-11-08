"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Company } from "@/types";
import { formatDate, translateRole } from "@/lib/utils";
import { Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { selectCompanyAction, getCompaniesAction } from "@/lib/actions/company.actions";
import { toast } from "sonner";

interface CompaniesData {
    companies: Company[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export function CompaniesTable() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [selectingId, setSelectingId] = useState<string | null>(null);
    const [data, setData] = useState<CompaniesData>({
        companies: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
    });
    const [loading, setLoading] = useState(true);

    const currentPage = parseInt(searchParams.get("page") || "1");

    const fetchCompanies = async (page: number, limit = 10) => {
        setLoading(true);

        const result = await getCompaniesAction(page, limit);

        if (result.success && result.data) {
            const newData = {
                companies: result.data.data || [],
                meta: result.data.meta,
            };
            setData(newData);
        } else {
            toast.error(result.message);
            setData({
                companies: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
            });
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchCompanies(currentPage);

        const handleCompanyCreated = () => {
            fetchCompanies(currentPage);
        };

        window.addEventListener('companyCreated', handleCompanyCreated);

        return () => {
            window.removeEventListener('companyCreated', handleCompanyCreated);
        };
    }, [currentPage]);

    const updateSearchParams = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (newPage: number) => {
        updateSearchParams(newPage);
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

    if (data.companies.length === 0) {
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

    const totalPages = data.meta?.totalPages || 1;
    const total = data.meta?.total || data.companies.length;
    const limit = data.meta?.limit || 10;
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
                            {data.companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell className="font-medium">{company.name}</TableCell>
                                    <TableCell>
                                        <Badge>
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
                                disabled={currentPage === 1 || loading}
                                title="Primeira página"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                title="Página anterior"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || loading}
                                title="Próxima página"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages || loading}
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