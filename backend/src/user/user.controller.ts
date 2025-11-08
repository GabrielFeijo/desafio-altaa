import {
	Controller,
	Get,
	Put,
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
import { UserService } from './user.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@ApiOperation({ summary: 'Buscar perfil do usuário' })
	@ApiResponse({
		status: 200,
		description: 'Perfil do usuário',
	})
	@ApiResponse({
		status: 401,
		description: 'Não autenticado',
	})
	async getProfile(@CurrentUser() user: { userId: string }) {
		return this.userService.getProfile(user.userId);
	}

	@Put('profile')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Atualizar perfil do usuário' })
	@ApiResponse({
		status: 200,
		description: 'Perfil atualizado com sucesso',
	})
	@ApiResponse({
		status: 409,
		description: 'Email já está em uso',
	})
	async updateProfile(
		@CurrentUser() user: { userId: string },
		@Body() updateProfileDto: UpdateProfileDto
	) {
		const updatedUser = await this.userService.updateProfile(
			user.userId,
			updateProfileDto
		);

		return {
			message: 'Perfil atualizado com sucesso',
			user: updatedUser,
		};
	}

	@Put('password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Atualizar senha do usuário' })
	@ApiResponse({
		status: 200,
		description: 'Senha atualizada com sucesso',
	})
	@ApiResponse({
		status: 400,
		description: 'Senha atual incorreta',
	})
	async updatePassword(
		@CurrentUser() user: { userId: string },
		@Body() updatePasswordDto: UpdatePasswordDto
	) {
		await this.userService.updatePassword(user.userId, updatePasswordDto);

		return {
			message: 'Senha atualizada com sucesso',
		};
	}
}
