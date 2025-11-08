'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import api from '@/services/api';
import { Role } from '@/types';
import { AxiosError } from 'axios';

async function getAuthHeaders() {
	const cookieStore = await cookies();
	const token = cookieStore.get('token');
	return {
		Cookie: `token=${token?.value}`,
	};
}

export async function createCompanyAction(formData: FormData) {
	const name = formData.get('name') as string;
	const logo = formData.get('logo') as string;

	try {
		const headers = await getAuthHeaders();
		const response = await api.post(
			'/company',
			{ name, logo: logo || undefined },
			{ headers }
		);

		revalidatePath('/dashboard');
		return { success: true, data: response.data };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
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
		const headers = await getAuthHeaders();
		const response = await api.put(
			`/company/${companyId}`,
			{ name, logo: logo || undefined },
			{ headers }
		);

		revalidatePath('/dashboard');
		revalidatePath(`/company/${companyId}`);
		return { success: true, data: response.data };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
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
		const headers = await getAuthHeaders();
		const response = await api.post(
			`/company/${companyId}/invite`,
			{ email, role },
			{ headers }
		);

		revalidatePath(`/company/${companyId}`);
		return { success: true, data: response.data };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
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
		const headers = await getAuthHeaders();
		await api.delete(`/company/${companyId}/member/${memberId}`, { headers });

		revalidatePath(`/company/${companyId}`);
		return { success: true };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
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
		const headers = await getAuthHeaders();
		await api.patch(
			`/company/${companyId}/member/${memberId}`,
			{ role },
			{ headers }
		);

		revalidatePath(`/company/${companyId}`);
		return { success: true };
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

export async function selectCompanyAction(companyId: string) {
	try {
		const headers = await getAuthHeaders();
		await api.post(`/company/${companyId}/select`, {}, { headers });

		revalidatePath('/dashboard');
		return { success: true };
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
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
