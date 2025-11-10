import { StatsCards } from "@/components/dashboard/stats-cards";
import { CompaniesTable } from "@/components/dashboard/companies-table";
import { CreateCompanyDialog } from "@/components/forms/create-company-dialog";
import { Suspense } from "react";
import CompaniesTableSkeleton from "@/components/skeleton/companies-table-skeleton";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Gerencie suas empresas e acompanhe suas atividades
                    </p>
                </div>
                <CreateCompanyDialog />
            </div>

            <StatsCards />
            <Suspense fallback={<CompaniesTableSkeleton />}>
                <CompaniesTable />
            </Suspense>
        </div>
    );
}