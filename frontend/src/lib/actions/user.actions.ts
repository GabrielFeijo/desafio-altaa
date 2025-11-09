'use server';

import { revalidatePath } from 'next/cache';
import api from '@/lib/actions/api';
import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function handleAuthError(error: AxiosError) {
	if (error.status === 401) {
		const cookieStore = await cookies();
		cookieStore.delete('token');
		redirect('/login?expired=true');
	}
}

export async function getUserProfile() {
	try {
		const response = await api.get('/user/profile');
		return { success: true, data: response.data };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
		await handleAuthError(error);
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
		const response = await api.put('/user/profile', { name, email });

		revalidatePath('/profile');
		return { success: true, data: response.data };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
		await handleAuthError(error);
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
		await api.put('/user/password', { currentPassword, newPassword });

		return { success: true, message: 'Senha atualizada com sucesso' };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
		await handleAuthError(error);
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
