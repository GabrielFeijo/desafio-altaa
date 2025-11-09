import {
	Injectable,
	ForbiddenException,
	ConflictException,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { Role } from '@prisma/client';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class InviteService {
	constructor(
		private prisma: PrismaService,
		private emailService: EmailService
	) {}

	async create(
		createInviteDto: CreateInviteDto,
		companyId: string,
		userId: string
	) {
		const { email, role } = createInviteDto;

		const inviterMembership = await this.prisma.membership.findUnique({
			where: {
				userId_companyId: {
					userId,
					companyId,
				},
			},
		});

		if (!inviterMembership) {
			throw new ForbiddenException('Você não é membro desta empresa');
		}

		if (
			inviterMembership.role !== Role.OWNER &&
			inviterMembership.role !== Role.ADMIN
		) {
			throw new ForbiddenException(
				'Apenas OWNER e ADMIN podem convidar membros'
			);
		}

		if (inviterMembership.role === Role.ADMIN && role === Role.OWNER) {
			throw new ForbiddenException('ADMIN não pode convidar OWNER');
		}

		const existingUser = await this.prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			const existingMembership = await this.prisma.membership.findUnique({
				where: {
					userId_companyId: {
						userId: existingUser.id,
						companyId,
					},
				},
			});

			if (existingMembership) {
				throw new ConflictException('Usuário já é membro desta empresa');
			}
		}

		const existingInvite = await this.prisma.invite.findFirst({
			where: {
				email,
				companyId,
				accepted: false,
				expiresAt: {
					gte: new Date(),
				},
			},
		});

		if (existingInvite) {
			throw new ConflictException(
				'Já existe um convite pendente para este email'
			);
		}

		const token = `invite-${Date.now()}-${Math.random().toString(36).substring(7)}`;

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		const invite = await this.prisma.invite.create({
			data: {
				email,
				token,
				role,
				companyId,
				expiresAt,
			},
			include: {
				company: {
					select: {
						name: true,
					},
				},
			},
		});

		await this.emailService.sendInviteEmail({
			invitedEmail: invite.email,
			companyName: invite.company.name,
			role: invite.role,
			inviteToken: invite.token,
			expiresAt: invite.expiresAt,
		});

		return {
			id: invite.id,
			email: invite.email,
			role: invite.role,
			token: invite.token,
			expiresAt: invite.expiresAt,
			companyName: invite.company.name,
		};
	}

	async findAllByCompany(companyId: string, userId: string) {
		const membership = await this.prisma.membership.findUnique({
			where: {
				userId_companyId: {
					userId,
					companyId,
				},
			},
		});

		if (!membership) {
			throw new ForbiddenException('Você não é membro desta empresa');
		}

		const invites = await this.prisma.invite.findMany({
			where: {
				companyId,
				accepted: false,
				expiresAt: {
					gte: new Date(),
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		return invites.map((invite) => ({
			id: invite.id,
			email: invite.email,
			role: invite.role,
			expiresAt: invite.expiresAt,
			createdAt: invite.createdAt,
		}));
	}

	async delete(inviteId: string, companyId: string, userId: string) {
		const membership = await this.prisma.membership.findUnique({
			where: {
				userId_companyId: {
					userId,
					companyId,
				},
			},
		});

		if (!membership) {
			throw new ForbiddenException('Você não é membro desta empresa');
		}

		if (membership.role !== Role.OWNER && membership.role !== Role.ADMIN) {
			throw new ForbiddenException(
				'Apenas OWNER e ADMIN podem cancelar convites'
			);
		}

		const invite = await this.prisma.invite.findUnique({
			where: { id: inviteId },
		});

		if (!invite || invite.companyId !== companyId) {
			throw new NotFoundException('Convite não encontrado');
		}

		await this.prisma.invite.delete({
			where: { id: inviteId },
		});

		return {
			message: 'Convite cancelado com sucesso',
		};
	}

	async validateToken(token: string) {
		if (!token) {
			throw new BadRequestException('Token não fornecido');
		}

		const invite = await this.prisma.invite.findUnique({
			where: { token },
			include: {
				company: {
					select: {
						name: true,
					},
				},
			},
		});

		if (!invite) {
			throw new NotFoundException('Convite não encontrado');
		}

		if (invite.accepted) {
			throw new BadRequestException('Este convite já foi aceito');
		}

		if (invite.expiresAt < new Date()) {
			throw new BadRequestException('Este convite expirou');
		}

		return {
			valid: true,
			expiresAt: invite.expiresAt,
		};
	}
}
