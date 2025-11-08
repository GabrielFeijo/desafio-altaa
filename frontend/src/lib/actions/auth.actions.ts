'use server';

import { cookies } from 'next/headers';
import api from '@/services/api';
import { AxiosError } from 'axios';

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

		return { success: true, message: response.data.message };
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

		return { success: true, message: response.data.message };
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

export async function logoutAction() {
	try {
		await api.post('/auth/logout');
		const cookieStore = await cookies();
		cookieStore.delete('token');
		return { success: true };
	} catch {
		return { success: false };
	}
}

export async function getCurrentUser() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get('token');

		if (!token) return null;

		const response = await api.post(
			'/auth/me',
			{},
			{
				headers: {
					Cookie: `token=${token.value}`,
				},
			}
		);

		return response.data;
	} catch {
		return null;
	}
}
