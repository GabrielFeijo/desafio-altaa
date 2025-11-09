'use server';

import { revalidatePath } from 'next/cache';
import api from '@/lib/actions/api';
import { Role } from '@/types';
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

export async function createCompanyAction(formData: FormData) {
	const name = formData.get('name') as string;
	const logo = formData.get('logo') as string;

	try {
		const response = await api.post('/company', {
			name,
			logo: logo || undefined,
		});

		revalidatePath('/dashboard');
		return { success: true, data: response.data };
	} catch (err) {
		const error = err as AxiosError<{ message?: string; statusCode?: number }>;
		await handleAuthError(error);
		const errorMessage =
			error.response?.data?.message ?? error.message ?? 'Erro ao criar empresa';

		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function updateCompanyAction(
	companyId: string,
	formData: FormData
) {
	const name = formData.get('name') as string;
	const logo = formData.get('logo') as string;

	try {
		const response = await api.put(`/company/${companyId}`, {
			name,
			logo: logo || undefined,
		});

		revalidatePath('/dashboard');
		revalidatePath(`/company/${companyId}`);
		return { success: true, data: response.data };
	} catch (err) {
		const error = err as AxiosError<{ message?: string; statusCode?: number }>;
		await handleAuthError(error);
		const errorMessage =
			error.response?.data?.message ??
			error.message ??
			'Erro ao atualizar empresa';

		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function inviteMemberAction(
	companyId: string,
	email: string,
	role: Role
) {
	try {
		const response = await api.post(`/company/${companyId}/invite`, {
			email,
			role,
		});

		revalidatePath(`/company/${companyId}`);
		return { success: true, data: response.data };
	} catch (err) {
		const error = err as AxiosError<{ message?: string; statusCode?: number }>;
		await handleAuthError(error);
		const errorMessage =
			error.response?.data?.message ??
			error.message ??
			'Erro ao enviar convite';

		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function removeMemberAction(companyId: string, memberId: string) {
	try {
		await api.delete(`/company/${companyId}/member/${memberId}`);

		revalidatePath(`/company/${companyId}`);
		return { success: true };
	} catch (err) {
		const error = err as AxiosError<{ message?: string; statusCode?: number }>;
		const errorMessage =
			error.response?.data?.message ??
			error.message ??
			'Erro ao remover membro';

		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function updateMemberRoleAction(
	companyId: string,
	memberId: string,
	role: Role
) {
	try {
		await api.patch(`/company/${companyId}/member/${memberId}`, { role });

		revalidatePath(`/company/${companyId}`);
		return { success: true };
	} catch (err) {
		const error = err as AxiosError<{ message?: string; statusCode?: number }>;
		await handleAuthError(error);
		const errorMessage =
			error.response?.data?.message ??
			error.message ??
			'Erro ao atualizar papel';

		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function selectCompanyAction(companyId: string) {
	try {
		await api.post(`/company/${companyId}/select`);

		revalidatePath('/dashboard');
		return { success: true };
	} catch (err) {
		const error = err as AxiosError<{ message?: string; statusCode?: number }>;
		await handleAuthError(error);
		const errorMessage =
			error.response?.data?.message ??
			error.message ??
			'Erro ao selecionar empresa';

		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function getCompaniesAction(page: number = 1, limit: number = 10) {
	try {
		const response = await api.get('/companies', {
			params: { page, limit },
		});

		return {
			success: true,
			data: response.data,
		};
	} catch (err) {
		const error = err as AxiosError<{ message?: string; statusCode?: number }>;
		await handleAuthError(error);
		const errorMessage =
			error.response?.data?.message ??
			error.message ??
			'Erro ao carregar empresas';

		return {
			success: false,
			message: errorMessage,
			data: {
				data: [],
				meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
			},
		};
	}
}
