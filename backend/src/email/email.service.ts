import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
	to: string;
	subject: string;
	text?: string;
}

export interface InviteEmailData {
	invitedEmail: string;
	companyName: string;
	role: string;
	inviteToken: string;
	expiresAt: Date;
}

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);
	private readonly frontendUrl: string;

	constructor(private configService: ConfigService) {
		this.frontendUrl =
			this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
	}

	async sendEmail(options: EmailOptions): Promise<void> {
		this.simulateEmail(options);
	}

	async sendInviteEmail(data: InviteEmailData): Promise<void> {
		const inviteUrl = `${this.frontendUrl}/accept-invite?token=${data.inviteToken}`;

		const subject = `Você foi convidado para ${data.companyName}`;

		await this.sendEmail({
			to: data.invitedEmail,
			subject,
			text: `Olá, voce foi convidado para ${data.companyName} como ${data.role}.\n\nClique aqui para aceitar: ${inviteUrl}`,
		});
	}

	private simulateEmail(options: EmailOptions): void {
		this.logger.log(
			`Simulando envio de email para ${options.to} com assunto ${options.subject}`
		);
	}
}
