export enum Role {
	OWNER = 'OWNER',
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER',
}

export interface User {
	id: string;
	email: string;
	name: string;
	activeCompanyId: string | null;
	createdAt: string;
}

export interface Company {
	id: string;
	name: string;
	logo: string | null;
	role: Role;
	joinedAt?: string;
	memberCount?: number;
	members?: Member[];
}

export interface Member {
	id: string;
	name: string;
	email: string;
	role: Role;
	joinedAt: string;
}

export interface Invite {
	id: string;
	email: string;
	role: Role;
	token: string;
	expiresAt: string;
	createdAt: string;
	companyName?: string;
}

export interface AuthResponse {
	user: User;
	token?: string;
	message?: string;
}

export interface CompanyResponse {
	company: Company;
	message?: string;
}

export interface CompaniesResponse {
	data: Company[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface InviteResponse {
	invite: Invite;
	message?: string;
}

export interface InvitesResponse {
	invites: Invite[];
	count: number;
}

export interface ApiError {
	message: string;
	status: number;
	error?: string;
}
