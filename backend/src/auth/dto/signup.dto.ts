import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class SignUpDto {
	@ApiProperty({
		description: 'Email do usuário (único no sistema)',
		example: 'usuario@example.com',
	})
	@IsEmail({}, { message: 'Email inválido' })
	email: string;

	@ApiProperty({
		description: 'Senha do usuário (mínimo 6 caracteres)',
		example: 'senha123',
		minLength: 6,
	})
	@IsString()
	@MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
	password: string;

	@ApiProperty({
		description: 'Nome completo do usuário',
		example: 'Gabriel Feijó',
		maxLength: 100,
	})
	@IsString()
	@MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
	@MaxLength(100, { message: 'Nome não pode ter mais de 100 caracteres' })
	name: string;
}
