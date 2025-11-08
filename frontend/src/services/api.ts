import axios, { AxiosError } from 'axios';
import { ApiError } from '@/types';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.response.use(
	(response) => response,
	(error: AxiosError<ApiError>) => {
		if (error.response) {
			const apiError: ApiError = {
				message: error.response.data.message || 'Erro ao processar requisição',
				statusCode: error.response.status,
				error: error.response.data.error,
			};
			return Promise.reject(apiError);
		} else if (error.request) {
			const networkError: ApiError = {
				message: 'Erro de conexão. Verifique sua internet.',
				statusCode: 0,
			};
			return Promise.reject(networkError);
		} else {
			const unknownError: ApiError = {
				message: error.message || 'Erro desconhecido',
				statusCode: 500,
			};
			return Promise.reject(unknownError);
		}
	}
);

export default api;
