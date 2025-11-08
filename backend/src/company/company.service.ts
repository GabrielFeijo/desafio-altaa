import {
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Role } from '@prisma/client';

@Injectable()
export class CompanyService {
	constructor(private prisma: PrismaService) {}

	async create(createCompanyDto: CreateCompanyDto, userId: string) {
		const { name, logo } = createCompanyDto;

		const company = await this.prisma.$transaction(async (tx) => {
			const newCompany = await tx.company.create({
				data: {
					name,
					logo,
				},
			});

			await tx.membership.create({
				data: {
					userId,
					companyId: newCompany.id,
					role: Role.OWNER,
				},
			});

			await tx.user.update({
				where: { id: userId },
				data: { activeCompanyId: newCompany.id },
			});

			return newCompany;
		});

		return {
			id: company.id,
			name: company.name,
			logo: company.logo,
			role: Role.OWNER,
		};
	}

	async findAll(userId: string, page: number = 1, limit: number = 10) {
		const skip = (page - 1) * limit;

		const [memberships, total] = await Promise.all([
			this.prisma.membership.findMany({
				where: { userId },
				include: {
					company: {
						select: {
							id: true,
							name: true,
							logo: true,
							createdAt: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
			}),
			this.prisma.membership.count({ where: { userId } }),
		]);

		const companies = memberships.map((m) => ({
			id: m.company.id,
			name: m.company.name,
			logo: m.company.logo,
			role: m.role,
			joinedAt: m.createdAt,
		}));

		return {
			data: companies,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async findOne(companyId: string, userId: string) {
		const membership = await this.prisma.membership.findUnique({
			where: {
				userId_companyId: {
					userId,
					companyId,
				},
			},
		});

		if (!membership) {
			throw new ForbiddenException(
				'Você não tem permissão para acessar esta empresa'
			);
		}

		const company = await this.prisma.company.findUnique({
			where: { id: companyId },
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
					orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
				},
			},
		});

		if (!company) {
			throw new NotFoundException('Empresa não encontrada');
		}

		const members = company.members.map((m) => ({
			id: m.user.id,
			name: m.user.name,
			email: m.user.email,
			role: m.role,
			joinedAt: m.createdAt,
		}));

		return {
			id: company.id,
			name: company.name,
			logo: company.logo,
			role: membership.role,
			members,
			memberCount: members.length,
		};
	}

	async update(
		companyId: string,
		updateCompanyDto: UpdateCompanyDto,
		userId: string
	) {
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
				'Apenas OWNER e ADMIN podem atualizar empresa'
			);
		}

		const company = await this.prisma.company.update({
			where: { id: companyId },
			data: {
				name: updateCompanyDto.name,
				logo: updateCompanyDto.logo,
			},
			select: {
				id: true,
				name: true,
				logo: true,
			},
		});

		return {
			...company,
			role: membership.role,
		};
	}

	async selectCompany(userId: string, companyId: string) {
		const membership = await this.prisma.membership.findUnique({
			where: {
				userId_companyId: {
					userId,
					companyId,
				},
			},
			include: {
				company: true,
			},
		});

		if (!membership) {
			throw new NotFoundException(
				'Empresa não encontrada ou você não é membro'
			);
		}

		await this.prisma.user.update({
			where: { id: userId },
			data: { activeCompanyId: companyId },
		});

		return {
			id: membership.company.id,
			name: membership.company.name,
			logo: membership.company.logo,
			role: membership.role,
		};
	}
}
