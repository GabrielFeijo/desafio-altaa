import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
	const d = new Date(date);
	return d.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
}

export function formatDateTime(date: string | Date): string {
	const d = new Date(date);
	return d.toLocaleString('pt-BR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function translateRole(role: string): string {
	const roles: Record<string, string> = {
		OWNER: 'Proprietário',
		ADMIN: 'Administrador',
		MEMBER: 'Membro',
	};
	return roles[role] || role;
}

export function getRoleColor(role: string): string {
	const colors: Record<string, string> = {
		OWNER:
			'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
		ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		MEMBER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
	};
	return colors[role] || colors.MEMBER;
}
