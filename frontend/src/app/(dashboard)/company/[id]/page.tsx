import { Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Company } from "@/types";
import { Users } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { EditCompanyDialogTrigger } from "@/components/company/edit-company-dialog-trigger";
import { InviteDialogTrigger } from "@/components/company/invite-dialog-trigger";
import { MembersTableServer } from "@/components/company/members-table-server";
import CompanySkeleton from "@/components/skeleton/company-skeleton";
import { translateRole } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/actions/api";

async function getCompany(id: string): Promise<Company | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) return null;

    const response = await api.get(`/company/${id}`, {
      headers: {
        Cookie: `token=${token.value}`,
      },
    });

    return response.data;
  } catch {
    return null;
  }
}

async function CompanyContent({ id }: { id: string }) {
  const company = await getCompany(id);

  if (!company) {
    notFound();
  }

  const canInvite = company.role === "OWNER" || company.role === "ADMIN";
  const canEdit = company.role === "OWNER" || company.role === "ADMIN";

  return (
    <div className="space-y-6">
      <BackButton />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          <div className="text-muted-foreground flex gap-2">
            <p>Você é</p>
            <Badge>
              {translateRole(company.role)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && <EditCompanyDialogTrigger company={company} />}
          {canInvite && <InviteDialogTrigger companyId={company.id} />}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Membros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.memberCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Membros ativos na empresa
            </p>
          </CardContent>
        </Card>
      </div>

      <MembersTableServer
        members={company.members || []}
        companyId={company.id}
        userRole={company.role}
      />
    </div>
  );
}

interface CompanyPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<CompanySkeleton />}>
      <CompanyContent id={id} />
    </Suspense>
  );
}