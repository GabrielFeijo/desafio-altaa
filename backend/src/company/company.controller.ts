import {
	Controller,
	Get,
	Post,
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
import { SelectCompanyDto } from './dto/select-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
}
