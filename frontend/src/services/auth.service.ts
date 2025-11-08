import api from './api';

export const authService = {
	async logout(): Promise<void> {
		await api.post('/auth/logout');
	},
};
