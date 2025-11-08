import api from './api';
import {
	Company,
	CompanyResponse,
	CompaniesResponse,
	InviteResponse,
	InvitesResponse,
	Role,
} from '@/types';

export const companyService = {
	async create(data: {
		name: string;
		logo?: string;
	}): Promise<CompanyResponse> {
		const response = await api.post<CompanyResponse>('/company', data);
		return response.data;
	},

	async list(page: number = 1, limit: number = 10): Promise<CompaniesResponse> {
		const response = await api.get<CompaniesResponse>('/companies', {
			params: { page, limit },
		});
		return response.data;
	},

	async get(id: string): Promise<Company> {
		const response = await api.get<Company>(`/company/${id}`);
		return response.data;
	},

	async select(id: string): Promise<CompanyResponse> {
		const response = await api.post<CompanyResponse>(`/company/${id}/select`);
		return response.data;
	},

	async invite(
		companyId: string,
		data: { email: string; role: Role }
	): Promise<InviteResponse> {
		const response = await api.post<InviteResponse>(
			`/company/${companyId}/invite`,
			data
		);
		return response.data;
	},

	async listInvites(companyId: string): Promise<InvitesResponse> {
		const response = await api.get<InvitesResponse>(
			`/company/${companyId}/invites`
		);
		return response.data;
	},

	async cancelInvite(
		companyId: string,
		inviteId: string
	): Promise<{ message: string }> {
		const response = await api.delete(
			`/company/${companyId}/invite/${inviteId}`
		);
		return response.data;
	},
};
