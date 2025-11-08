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

export function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/);

	if (parts.length === 0) return '';

	const first = parts[0][0];
	const last = parts.length > 1 ? parts[parts.length - 1][0] : '';

	return (first + last).toUpperCase();
}
