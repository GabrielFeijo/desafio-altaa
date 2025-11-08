import api from './api';
import { AuthResponse } from '@/types';

export const authService = {
	async signup(data: {
		email: string;
		password: string;
		name: string;
	}): Promise<AuthResponse> {
		const response = await api.post<AuthResponse>('/auth/signup', data);
		return response.data;
	},

	async login(data: {
		email: string;
		password: string;
	}): Promise<AuthResponse> {
		const response = await api.post<AuthResponse>('/auth/login', data);
		return response.data;
	},

	async logout(): Promise<void> {
		await api.post('/auth/logout');
	},

	async me(): Promise<{ userId: string; activeCompanyId: string | null }> {
		const response = await api.post('/auth/me');
		return response.data;
	},

	async acceptInvite(data: {
		token: string;
		email?: string;
		password?: string;
		name?: string;
	}): Promise<AuthResponse> {
		const response = await api.post<AuthResponse>('/auth/accept-invite', data);
		return response.data;
	},
};
