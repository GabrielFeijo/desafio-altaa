import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('welcome')
@Controller()
export class WelcomeController {
	@Public()
	@Get()
	@ApiOperation({ summary: 'Endpoint de boas-vindas da API' })
	@ApiResponse({
		status: 200,
		description: 'Informações da API e status do servidor',
	})
	getWelcome() {
		const now = new Date();

		const serverTime = {
			timestamp: now.toISOString(),
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			formatted: now.toLocaleString('pt-BR', {
				dateStyle: 'full',
				timeStyle: 'long',
			}),
			unix: Math.floor(now.getTime() / 1000),
		};

		const uptime = process.uptime();
		const uptimeFormatted = this.formatUptime(uptime);

		return {
			message: '🚀 Bem-vindo à Altaa.ai API',
			version: '1.0.0',
			description: 'API Multi-tenant para gerenciamento de empresas e usuários',
			status: 'online',
			environment: process.env.NODE_ENV || 'development',

			server: {
				time: serverTime,
				uptime: uptimeFormatted,
				node: process.version,
				platform: process.platform,
			},

			author: {
				name: 'Gabriel Feijó',
				github: 'https://github.com/GabrielFeijo',
				repository: 'https://github.com/GabrielFeijo/desafio-altaa',
			},

			tip: '💡 Acesse /api/docs para ver toda a documentação interativa da API',
		};
	}

	@Public()
	@Get('health')
	@ApiOperation({ summary: 'Health check do servidor' })
	@ApiResponse({
		status: 200,
		description: 'Status de saúde do servidor',
	})
	getHealth() {
		const now = new Date();
		const uptime = process.uptime();

		return {
			status: 'healthy',
			timestamp: now.toISOString(),
			uptime: this.formatUptime(uptime),
			system: {
				platform: process.platform,
				node: process.version,
				pid: process.pid,
			},
		};
	}

	private formatUptime(seconds: number): string {
		const days = Math.floor(seconds / 86400);
		const hours = Math.floor((seconds % 86400) / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		const parts = [];
		if (days > 0) parts.push(`${days}d`);
		if (hours > 0) parts.push(`${hours}h`);
		if (minutes > 0) parts.push(`${minutes}m`);
		if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

		return parts.join(' ');
	}
}
