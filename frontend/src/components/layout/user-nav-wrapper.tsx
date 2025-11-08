import { cookies } from "next/headers";
import api from "@/services/api";
import { UserNavClient } from "./user-nav-client";

interface UserData {
    id: string;
    name: string;
    email: string;
    activeCompanyId: string | null;
}

async function getUserData(): Promise<UserData | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");

        if (!token) return null;

        const response = await api.get("/user/profile", {
            headers: {
                Cookie: `token=${token.value}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        return null;
    }
}

export async function UserNav() {
    const user = await getUserData();

    return <UserNavClient user={user} />;
}