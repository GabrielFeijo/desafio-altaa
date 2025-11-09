import api from "@/lib/actions/api";
import { UserNavClient } from "./user-nav-client";

interface UserData {
    id: string;
    name: string;
    email: string;
    activeCompanyId: string | null;
}

async function getUserData(): Promise<UserData | null> {
    try {
        const response = await api.get("/user/profile");

        return response.data;
    } catch {
        return null;
    }
}

export async function UserNav() {
    const user = await getUserData();

    return <UserNavClient user={user} />;
}