import {
	Controller,
	Get,
	Post,
	Delete,
	Body,
	Param,
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
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('company')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class InviteController {
	constructor(private readonly inviteService: InviteService) {}

	@Post('company/:id/invite')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Criar convite para novo membro',
		description: 'Simula envio de email com link de convite (OWNER e ADMIN)',
	})
	@ApiResponse({
		status: 201,
		description: 'Convite criado com sucesso',
	})
	@ApiResponse({
		status: 403,
		description: 'Sem permissão (apenas OWNER e ADMIN)',
	})
	@ApiResponse({
		status: 409,
		description: 'Usuário já é membro ou convite pendente existe',
	})
	async create(
		@Param('id') id: string,
		@Body() createInviteDto: CreateInviteDto,
		@CurrentUser() user: { userId: string }
	) {
		const invite = await this.inviteService.create(
			createInviteDto,
			id,
			user.userId
		);

		return {
			message: 'Convite criado com sucesso (email simulado)',
			invite,
		};
	}

	@Get('company/:id/invites')
	@ApiOperation({
		summary: 'Listar convites pendentes da empresa',
	})
	@ApiResponse({
		status: 200,
		description: 'Lista de convites pendentes',
	})
	@ApiResponse({
		status: 403,
		description: 'Você não é membro desta empresa',
	})
	async findAll(
		@Param('id') id: string,
		@CurrentUser() user: { userId: string }
	) {
		const invites = await this.inviteService.findAllByCompany(id, user.userId);

		return {
			invites,
			count: invites.length,
		};
	}

	@Delete('company/:companyId/invite/:inviteId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Cancelar convite pendente',
		description: 'Apenas OWNER e ADMIN podem cancelar convites',
	})
	@ApiResponse({
		status: 200,
		description: 'Convite cancelado com sucesso',
	})
	@ApiResponse({
		status: 403,
		description: 'Sem permissão (apenas OWNER e ADMIN)',
	})
	@ApiResponse({
		status: 404,
		description: 'Convite não encontrado',
	})
	async delete(
		@Param('companyId') companyId: string,
		@Param('inviteId') inviteId: string,
		@CurrentUser() user: { userId: string }
	) {
		return this.inviteService.delete(inviteId, companyId, user.userId);
	}
}
