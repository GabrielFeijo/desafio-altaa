import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function CompaniesTableSkeleton() {
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
    )
}