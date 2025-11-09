import axios, { AxiosError } from 'axios';
import { ApiError } from '@/types';
import { cookies } from 'next/headers';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
	const cookieStore = await cookies();
	const token = cookieStore.get('token');
	if (token) {
		config.headers.Cookie = `token=${token.value}`;
	}

	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError<ApiError>) => {
		const { response, request, message } = error;

		if (response?.status === 401 && request.path !== '/auth/login') {
			return Promise.reject({
				message: 'Sessão expirada. Por favor, faça login novamente.',
				status: 401,
				error: 'Unauthorized',
			} satisfies ApiError);
		}

		if (response) {
			return Promise.reject({
				message: response.data?.message || 'Erro ao processar requisição',
				status: response.status,
				error: response.data?.error,
			} satisfies ApiError);
		}

		if (request) {
			return Promise.reject({
				message: 'Erro de conexão. Verifique sua internet.',
				status: 0,
			} satisfies ApiError);
		}

		return Promise.reject({
			message: message || 'Erro desconhecido',
			status: 500,
		} satisfies ApiError);
	}
);

export default api;
