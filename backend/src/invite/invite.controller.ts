import {
	Controller,
	Get,
	Post,
	Delete,
	Body,
	Param,
	Query,
	UseGuards,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiQuery,
} from '@nestjs/swagger';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('company')
@Controller()
export class InviteController {
	constructor(private readonly inviteService: InviteService) {}

	@Post('company/:id/invite')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	@ApiBearerAuth('JWT-auth')
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
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('JWT-auth')
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
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth('JWT-auth')
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

	@Public()
	@Get('invite/validate')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Validar token de convite',
		description: 'Verifica se o token de convite é válido e não expirou',
	})
	@ApiQuery({
		name: 'token',
		required: true,
		type: String,
		description: 'Token do convite',
	})
	@ApiResponse({
		status: 200,
		description: 'Token válido',
		schema: {
			example: {
				valid: true,
				expiresAt: '2025-01-15T10:00:00.000Z',
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Token inválido, expirado ou já aceito',
	})
	async validateToken(@Query('token') token: string) {
		return this.inviteService.validateToken(token);
	}
}
