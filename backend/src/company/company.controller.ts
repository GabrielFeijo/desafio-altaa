import {
	Controller,
	Get,
	Post,
	Put,
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
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('company')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CompanyController {
	constructor(private readonly companyService: CompanyService) {}

	@Post('company')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Criar nova empresa' })
	@ApiResponse({
		status: 201,
		description: 'Empresa criada com sucesso',
	})
	@ApiResponse({
		status: 401,
		description: 'Não autenticado',
	})
	async create(
		@Body() createCompanyDto: CreateCompanyDto,
		@CurrentUser() user: { userId: string }
	) {
		const company = await this.companyService.create(
			createCompanyDto,
			user.userId
		);

		return {
			message: 'Empresa criada com sucesso',
			company,
		};
	}

	@Get('companies')
	@ApiOperation({ summary: 'Listar empresas que o usuário participa' })
	@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
	@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
	@ApiResponse({
		status: 200,
		description: 'Lista de empresas',
	})
	@ApiResponse({
		status: 401,
		description: 'Não autenticado',
	})
	async findAll(
		@CurrentUser() user: { userId: string },
		@Query('page') page?: number,
		@Query('limit') limit?: number
	) {
		return this.companyService.findAll(
			user.userId,
			page ? Number(page) : 1,
			limit ? Number(limit) : 10
		);
	}

	@Get('company/:id')
	@ApiOperation({ summary: 'Buscar detalhes da empresa' })
	@ApiResponse({
		status: 200,
		description: 'Detalhes da empresa',
	})
	@ApiResponse({
		status: 403,
		description: 'Você não tem permissão para acessar esta empresa',
	})
	@ApiResponse({
		status: 404,
		description: 'Empresa não encontrada',
	})
	async findOne(
		@Param('id') id: string,
		@CurrentUser() user: { userId: string }
	) {
		return this.companyService.findOne(id, user.userId);
	}

	@Put('company/:id')
	@UseGuards(RolesGuard)
	@Roles(Role.OWNER, Role.ADMIN)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Atualizar empresa',
		description: 'Apenas OWNER e ADMIN podem atualizar empresa',
	})
	@ApiResponse({
		status: 200,
		description: 'Empresa atualizada com sucesso',
	})
	@ApiResponse({
		status: 403,
		description: 'Sem permissão (apenas OWNER e ADMIN)',
	})
	@ApiResponse({
		status: 404,
		description: 'Empresa não encontrada',
	})
	async update(
		@Param('id') id: string,
		@Body() updateCompanyDto: UpdateCompanyDto,
		@CurrentUser() user: { userId: string }
	) {
		const company = await this.companyService.update(
			id,
			updateCompanyDto,
			user.userId
		);

		return {
			message: 'Empresa atualizada com sucesso',
			company,
		};
	}

	@Post('company/:id/select')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Selecionar empresa ativa' })
	@ApiResponse({
		status: 200,
		description: 'Empresa selecionada com sucesso',
	})
	@ApiResponse({
		status: 404,
		description: 'Empresa não encontrada ou você não é membro',
	})
	async selectCompany(
		@Param('id') id: string,
		@CurrentUser() user: { userId: string }
	) {
		const company = await this.companyService.selectCompany(user.userId, id);

		return {
			message: 'Empresa selecionada com sucesso',
			company,
		};
	}
}
