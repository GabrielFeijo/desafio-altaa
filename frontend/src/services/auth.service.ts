import axios from 'axios';

export const authService = {
	async logout(): Promise<void> {
		const api = axios.create({
			baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
			withCredentials: true,
		});

		await api.post('/auth/logout');
	},
};
