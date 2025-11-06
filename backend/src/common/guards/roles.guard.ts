import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private prisma: PrismaService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!requiredRoles) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user || !user.activeCompanyId) {
			throw new ForbiddenException('Você precisa selecionar uma empresa ativa');
		}

		const membership = await this.prisma.membership.findUnique({
			where: {
				userId_companyId: {
					userId: user.userId,
					companyId: user.activeCompanyId,
				},
			},
		});

		if (!membership) {
			throw new ForbiddenException('Você não é membro da empresa ativa');
		}

		if (!requiredRoles.includes(membership.role)) {
			throw new ForbiddenException(
				`Você precisa ter uma das seguintes permissões: ${requiredRoles.join(', ')}`
			);
		}

		request.membership = membership;

		return true;
	}
}
