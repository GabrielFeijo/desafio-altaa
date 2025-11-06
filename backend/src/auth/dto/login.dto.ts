import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
	@ApiProperty({
		description: 'Email do usuário cadastrado',
		example: 'usuario@example.com',
	})
	@IsEmail({}, { message: 'Email inválido' })
	email: string;

	@ApiProperty({
		description: 'Senha do usuário',
		example: 'senha123',
		minLength: 6,
	})
	@IsString()
	@MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
	password: string;
}
