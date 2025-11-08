'use server';

import { cookies } from 'next/headers';
import api from '@/services/api';
import { AxiosError } from 'axios';

export async function acceptInviteAction(formData: FormData) {
	const token = formData.get('token') as string;
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;
	const name = formData.get('name') as string;
	const isNewUser = formData.get('isNewUser') === 'true';

	try {
		if (!isNewUser) {
			const cookieStore = await cookies();
			const userToken = cookieStore.get('token');

			if (!userToken) {
				return {
					success: false,
					message: 'Você precisa estar logado para aceitar o convite',
				};
			}

			const response = await api.post(
				'/auth/accept-invite',
				{ token },
				{
					headers: {
						Cookie: `token=${userToken.value}`,
					},
				}
			);

			return {
				success: true,
				message: response.data.message || 'Convite aceito com sucesso!',
				company: response.data.company,
			};
		}

		if (!email || !password || !name) {
			return {
				success: false,
				message: 'Preencha todos os campos obrigatórios',
			};
		}

		const response = await api.post('/auth/accept-invite', {
			token,
			email,
			password,
			name,
		});

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
			message: response.data.message || 'Convite aceito com sucesso!',
			company: response.data.company,
		};
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
		const errorMessage =
			error.response?.data?.message ??
			error.message ??
			'Erro ao aceitar convite';

		return {
			success: false,
			message: errorMessage,
		};
	}
}

export async function validateInviteToken(token: string) {
	try {
		if (!token) {
			return {
				valid: false,
				message: 'Token de convite não fornecido',
			};
		}

		return {
			valid: true,
			message: 'Token válido',
		};
	} catch (err) {
		const error = err as AxiosError<{ message?: string }>;
		return {
			valid: false,
			message: error.response?.data?.message ?? 'Token inválido ou expirado',
		};
	}
}
