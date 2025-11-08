import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

export default function UserNavSkeleton() {
    return (
        <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled>
            <Loader2 className="h-5 w-5 animate-spin" />
        </Button>
    );
}