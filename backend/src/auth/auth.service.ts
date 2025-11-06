import {
	Injectable,
	ConflictException,
	UnauthorizedException,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService
	) {}

	async signUp(signUpDto: SignUpDto) {
		const { email, password, name } = signUpDto;

		const existingUser = await this.prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			throw new ConflictException('Email já cadastrado');
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await this.prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
			},
		});

		const token = this.generateToken(user.id, user.activeCompanyId);

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				activeCompanyId: user.activeCompanyId,
			},
			token,
		};
	}

	async login(loginDto: LoginDto) {
		const { email, password } = loginDto;

		const user = await this.prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			throw new UnauthorizedException('Credenciais inválidas');
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException('Credenciais inválidas');
		}

		const token = this.generateToken(user.id, user.activeCompanyId);

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				activeCompanyId: user.activeCompanyId,
			},
			token,
		};
	}

	async acceptInvite(acceptInviteDto: AcceptInviteDto, currentUserId?: string) {
		const { token, email, password, name } = acceptInviteDto;

		const invite = await this.prisma.invite.findUnique({
			where: { token },
			include: { company: true },
		});

		if (!invite) {
			throw new NotFoundException('Convite não encontrado');
		}

		if (invite.expiresAt < new Date()) {
			throw new BadRequestException('Convite expirado');
		}

		if (invite.accepted) {
			throw new BadRequestException('Convite já foi aceito');
		}

		let user: User;

		if (currentUserId) {
			user = await this.prisma.user.findUnique({
				where: { id: currentUserId },
			});

			if (!user) {
				throw new NotFoundException('Usuário não encontrado');
			}

			if (invite.email !== user.email) {
				throw new BadRequestException(
					'Este convite não foi enviado para o seu email'
				);
			}
		}

		if (!user) {
			if (!email || !password || !name) {
				throw new BadRequestException(
					'Para aceitar o convite, forneça email, senha e nome'
				);
			}

			if (invite.email !== email) {
				throw new BadRequestException(
					'Email fornecido não corresponde ao convite'
				);
			}

			const existingUser = await this.prisma.user.findUnique({
				where: { email },
			});

			if (existingUser) {
				throw new ConflictException(
					'Email já cadastrado. Faça login para aceitar o convite'
				);
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			user = await this.prisma.user.create({
				data: {
					email,
					password: hashedPassword,
					name,
					activeCompanyId: invite.companyId,
				},
			});
		}

		await this.prisma.membership.create({
			data: {
				userId: user.id,
				companyId: invite.companyId,
				role: invite.role,
			},
		});

		await this.prisma.invite.update({
			where: { id: invite.id },
			data: {
				accepted: true,
				userId: user.id,
			},
		});

		if (!user.activeCompanyId) {
			user = await this.prisma.user.update({
				where: { id: user.id },
				data: { activeCompanyId: invite.companyId },
			});
		}

		const jwtToken = this.generateToken(user.id, user.activeCompanyId);

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				activeCompanyId: user.activeCompanyId,
			},
			company: {
				id: invite.company.id,
				name: invite.company.name,
			},
			token: jwtToken,
		};
	}

	private generateToken(
		userId: string,
		activeCompanyId: string | null
	): string {
		const payload = { userId, activeCompanyId };
		return this.jwtService.sign(payload);
	}
}
