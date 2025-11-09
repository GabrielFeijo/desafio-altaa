import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Shield, Clock } from "lucide-react";
import { Company } from "@/types";
import api from "@/lib/actions/api";

export const dynamic = 'force-dynamic';

async function getCompanies(): Promise<Company[]> {
    try {
        const response = await api.get("/companies?page=1&limit=1000");
        return response.data.data || [];
    } catch {
        return [];
    }
}

export async function StatsCards(
) {
    const companies = await getCompanies();
    const totalCompanies = companies.length;
    const ownerCount = companies.filter((c) => c.role === "OWNER").length;
    const adminCount = companies.filter((c) => c.role === "ADMIN").length;
    const memberCount = companies.filter((c) => c.role === "MEMBER").length;

    const stats = [
        {
            title: "Total de Empresas",
            value: totalCompanies,
            description: "Empresas que você participa",
            icon: Building2,
            color: "text-blue-600 dark:text-blue-400",
        },
        {
            title: "Como Proprietário",
            value: ownerCount,
            description: "Empresas que você é dono",
            icon: Shield,
            color: "text-purple-600 dark:text-purple-400",
        },
        {
            title: "Como Admin",
            value: adminCount,
            description: "Empresas que você administra",
            icon: Users,
            color: "text-green-600 dark:text-green-400",
        },
        {
            title: "Como Membro",
            value: memberCount,
            description: "Empresas que você é membro",
            icon: Clock,
            color: "text-orange-600 dark:text-orange-400",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <Icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}