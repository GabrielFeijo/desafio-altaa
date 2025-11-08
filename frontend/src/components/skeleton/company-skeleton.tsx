import { Skeleton } from "../ui/skeleton";

export default function CompanySkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-20" />
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
}