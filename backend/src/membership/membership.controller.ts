import {
	Controller,
	Delete,
	Patch,
	Param,
	Body,
	UseGuards,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('company')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MembershipController {
	constructor(private readonly membershipService: MembershipService) {}

	@Delete('company/:companyId/member/:memberId')
	@UseGuards(RolesGuard)
	@Roles(Role.OWNER, Role.ADMIN)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Remover membro da empresa',
		description:
			'OWNER pode remover qualquer um. ADMIN pode remover apenas MEMBER.',
	})
	@ApiResponse({
		status: 200,
		description: 'Membro removido com sucesso',
	})
	@ApiResponse({
		status: 403,
		description: 'Sem permissão',
	})
	@ApiResponse({
		status: 404,
		description: 'Membro não encontrado',
	})
	async removeMember(
		@Param('companyId') companyId: string,
		@Param('memberId') memberId: string,
		@CurrentUser() user: { userId: string }
	) {
		await this.membershipService.removeMember(companyId, memberId, user.userId);

		return {
			message: 'Membro removido com sucesso',
		};
	}

	@Patch('company/:companyId/member/:memberId')
	@UseGuards(RolesGuard)
	@Roles(Role.OWNER, Role.ADMIN)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Atualizar papel do membro',
		description:
			'OWNER pode alterar qualquer papel. ADMIN pode alterar apenas MEMBER.',
	})
	@ApiResponse({
		status: 200,
		description: 'Papel atualizado com sucesso',
	})
	@ApiResponse({
		status: 403,
		description: 'Sem permissão',
	})
	@ApiResponse({
		status: 404,
		description: 'Membro não encontrado',
	})
	async updateMemberRole(
		@Param('companyId') companyId: string,
		@Param('memberId') memberId: string,
		@Body() updateMemberRoleDto: UpdateMemberRoleDto,
		@CurrentUser() user: { userId: string }
	) {
		await this.membershipService.updateMemberRole(
			companyId,
			memberId,
			updateMemberRoleDto.role,
			user.userId
		);

		return {
			message: 'Papel atualizado com sucesso',
		};
	}
}
