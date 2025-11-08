'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import api from '@/services/api';
import { AxiosError } from 'axios';

async function getAuthHeaders() {
	const cookieStore = await cookies();
	const token = cookieStore.get('token');
	return {
		Cookie: `token=${token?.value}`,
	};
}

export async function getUserProfile() {
	try {
		const headers = await getAuthHeaders();
		const response = await api.get('/user/profile', { headers });
		return { success: true, data: response.data };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
		const errorMessage =
			error.response?.data?.message ??
			error.message ??
			'Erro ao carregar perfil';
		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function updateUserProfileAction(formData: FormData) {
	const name = formData.get('name') as string;
	const email = formData.get('email') as string;

	try {
		const headers = await getAuthHeaders();
		const response = await api.put(
			'/user/profile',
			{ name, email },
			{ headers }
		);

		revalidatePath('/profile');
		return { success: true, data: response.data };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
		const errorMessage =
			error.response?.data?.message ??
			error.message ??
			'Erro ao atualizar perfil';

		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function updatePasswordAction(formData: FormData) {
	const currentPassword = formData.get('currentPassword') as string;
	const newPassword = formData.get('newPassword') as string;

	try {
		const headers = await getAuthHeaders();
		await api.put(
			'/user/password',
			{ currentPassword, newPassword },
			{ headers }
		);

		return { success: true, message: 'Senha atualizada com sucesso' };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
		const errorMessage =
			error.response?.data?.message ??
			error.message ??
			'Erro ao atualizar senha';

		return {
			success: false,
			message: errorMessage,
		};
	}
}
