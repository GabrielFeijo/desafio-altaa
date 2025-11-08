import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
	@ApiProperty({
		description: 'Senha atual do usuário',
		example: 'senhaAtual123',
		minLength: 6,
	})
	@IsString()
	@MinLength(6, { message: 'Senha atual deve ter no mínimo 6 caracteres' })
	currentPassword: string;

	@ApiProperty({
		description: 'Nova senha do usuário',
		example: 'novaSenha456',
		minLength: 6,
	})
	@IsString()
	@MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
	newPassword: string;
}
