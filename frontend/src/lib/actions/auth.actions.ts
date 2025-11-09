'use server';

import { cookies } from 'next/headers';
import api from '@/lib/actions/api';
import { AxiosError } from 'axios';
import { redirect } from 'next/navigation';

async function handleAuthError(error: AxiosError) {
	if (error.status === 401) {
		const cookieStore = await cookies();
		cookieStore.delete('token');
		redirect('/login?expired=true');
	}
}

export async function loginAction(formData: FormData) {
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;

	try {
		const response = await api.post('/auth/login', { email, password });

		const setCookieHeader = response.headers['set-cookie'];
		if (setCookieHeader) {
			const cookieStore = await cookies();
			const tokenMatch = setCookieHeader[0].match(/token=([^;]+)/);
			if (tokenMatch) {
				cookieStore.set('token', tokenMatch[1], {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict',
					maxAge: 7 * 24 * 60 * 60,
				});
			}
		}

		return {
			success: true,
			message: response.data.message || 'Login realizado com sucesso!',
		};
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
		const errorMessage =
			error.response?.data?.message ?? error.message ?? 'Erro ao fazer login';

		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function signupAction(formData: FormData) {
	const name = formData.get('name') as string;
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;

	try {
		const response = await api.post('/auth/signup', { name, email, password });

		const setCookieHeader = response.headers['set-cookie'];
		if (setCookieHeader) {
			const cookieStore = await cookies();
			const tokenMatch = setCookieHeader[0].match(/token=([^;]+)/);
			if (tokenMatch) {
				cookieStore.set('token', tokenMatch[1], {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict',
					maxAge: 7 * 24 * 60 * 60,
				});
			}
		}

		return {
			success: true,
			message: response.data.message || 'Conta criada com sucesso!',
		};
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
		const errorMessage =
			error.response?.data?.message ?? error.message ?? 'Erro ao criar conta';

		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function getCurrentUser() {
	try {
		const response = await api.post('/auth/me');

		return response.data;
	} catch (err) {
		const error = err as AxiosError<{ message?: string; statusCode?: number }>;
		await handleAuthError(error);
		return null;
	}
}
