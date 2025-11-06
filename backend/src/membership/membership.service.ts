import {
	Injectable,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class MembershipService {
	constructor(private prisma: PrismaService) {}

	async findByUserAndCompany(userId: string, companyId: string) {
		return this.prisma.membership.findUnique({
			where: {
				userId_companyId: {
					userId,
					companyId,
				},
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				company: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	async removeMember(
		companyId: string,
		memberIdToRemove: string,
		userId: string
	) {
		const removerMembership = await this.prisma.membership.findUnique({
			where: {
				userId_companyId: {
					userId,
					companyId,
				},
			},
		});

		if (!removerMembership) {
			throw new ForbiddenException('Você não é membro desta empresa');
		}

		if (
			removerMembership.role !== Role.OWNER &&
			removerMembership.role !== Role.ADMIN
		) {
			throw new ForbiddenException(
				'Apenas OWNER e ADMIN podem remover membros'
			);
		}

		const memberToRemove = await this.prisma.membership.findUnique({
			where: {
				userId_companyId: {
					userId: memberIdToRemove,
					companyId,
				},
			},
		});

		if (!memberToRemove) {
			throw new NotFoundException('Membro não encontrado nesta empresa');
		}

		if (removerMembership.role === Role.ADMIN) {
			if (
				memberToRemove.role === Role.OWNER ||
				memberToRemove.role === Role.ADMIN
			) {
				throw new ForbiddenException('ADMIN não pode remover OWNER ou ADMIN');
			}
		}

		if (userId === memberIdToRemove && removerMembership.role === Role.OWNER) {
			const ownerCount = await this.prisma.membership.count({
				where: {
					companyId,
					role: Role.OWNER,
				},
			});

			if (ownerCount === 1) {
				throw new ForbiddenException(
					'Não é possível remover o único OWNER da empresa. Transfira a propriedade primeiro.'
				);
			}
		}

		await this.prisma.membership.delete({
			where: {
				userId_companyId: {
					userId: memberIdToRemove,
					companyId,
				},
			},
		});

		await this.prisma.user.updateMany({
			where: {
				id: memberIdToRemove,
				activeCompanyId: companyId,
			},
			data: {
				activeCompanyId: null,
			},
		});

		return {
			message: 'Membro removido com sucesso',
		};
	}
}
