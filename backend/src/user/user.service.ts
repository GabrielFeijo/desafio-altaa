import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async findById(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
				activeCompanyId: true,
				createdAt: true,
			},
		});

		if (!user) {
			throw new NotFoundException('Usuário não encontrado');
		}

		return user;
	}

	async findByEmail(email: string) {
		const user = await this.prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				name: true,
				activeCompanyId: true,
				createdAt: true,
			},
		});

		if (!user) {
			throw new NotFoundException('Usuário não encontrado');
		}

		return user;
	}

	async getProfile(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				activeCompanyId: true,
				createdAt: true,
				updatedAt: true,
				memberships: {
					select: {
						company: {
							select: {
								id: true,
								name: true,
							},
						},
						role: true,
					},
				},
			},
		});

		if (!user) {
			throw new NotFoundException('Usuário não encontrado');
		}

		return user;
	}

	async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
		const { name, email } = updateProfileDto;

		if (email) {
			const existingUser = await this.prisma.user.findUnique({
				where: { email },
			});

			if (existingUser && existingUser.id !== userId) {
				throw new ConflictException('Email já está em uso');
			}
		}

		const user = await this.prisma.user.update({
			where: { id: userId },
			data: {
				name,
				email,
			},
			select: {
				id: true,
				email: true,
				name: true,
				activeCompanyId: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return user;
	}

	async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
		const { currentPassword, newPassword } = updatePasswordDto;

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundException('Usuário não encontrado');
		}

		const isPasswordValid = await bcrypt.compare(
			currentPassword,
			user.password
		);

		if (!isPasswordValid) {
			throw new BadRequestException('Senha atual incorreta');
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await this.prisma.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		});
	}
}
