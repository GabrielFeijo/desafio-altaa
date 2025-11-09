import {
	Controller,
	Post,
	Body,
	Res,
	HttpCode,
	HttpStatus,
	UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OptionalAuthGuard } from './guards/optional-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('signup')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Cadastrar novo usuário' })
	@ApiResponse({
		status: 201,
		description: 'Usuário cadastrado com sucesso',
	})
	@ApiResponse({
		status: 409,
		description: 'Email já cadastrado',
	})
	async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
		const result = await this.authService.signUp(signUpDto);

		res.cookie('token', result.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return res.json({
			message: 'Usuário cadastrado com sucesso',
			user: result.user,
		});
	}

	@Public()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login de usuário' })
	@ApiResponse({
		status: 200,
		description: 'Login realizado com sucesso',
	})
	@ApiResponse({
		status: 401,
		description: 'Credenciais inválidas',
	})
	async login(@Body() loginDto: LoginDto, @Res() res: Response) {
		const result = await this.authService.login(loginDto);

		res.cookie('token', result.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return res.json({
			message: 'Login realizado com sucesso',
			user: result.user,
		});
	}

	@UseGuards(OptionalAuthGuard)
	@Post('accept-invite')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Aceitar convite para empresa' })
	@ApiResponse({
		status: 200,
		description: 'Convite aceito com sucesso',
	})
	@ApiResponse({
		status: 404,
		description: 'Convite não encontrado',
	})
	@ApiResponse({
		status: 400,
		description: 'Convite expirado ou já aceito',
	})
	async acceptInvite(
		@Body() acceptInviteDto: AcceptInviteDto,
		@CurrentUser() user: { userId: string } | null,
		@Res() res: Response
	) {
		const currentUserId = user?.userId || undefined;

		const result = await this.authService.acceptInvite(
			acceptInviteDto,
			currentUserId
		);

		res.cookie('token', result.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return res.json({
			message: 'Convite aceito com sucesso',
			user: result.user,
			company: result.company,
		});
	}

	@UseGuards(JwtAuthGuard)
	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth('JWT-auth')
	@ApiOperation({ summary: 'Logout do usuário' })
	@ApiResponse({
		status: 200,
		description: 'Logout realizado com sucesso',
	})
	async logout(@Res() res: Response) {
		res.clearCookie('token');

		return res.json({
			message: 'Logout realizado com sucesso',
		});
	}

	@UseGuards(JwtAuthGuard)
	@Post('me')
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth('JWT-auth')
	@ApiOperation({ summary: 'Buscar dados do usuário autenticado' })
	@ApiResponse({
		status: 200,
		description: 'Dados do usuário',
	})
	async me(@CurrentUser() user: { userId: string; activeCompanyId: string }) {
		return {
			userId: user.userId,
			activeCompanyId: user.activeCompanyId,
		};
	}
}
