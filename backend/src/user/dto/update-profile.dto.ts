import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
	@ApiProperty({
		description: 'Nome completo do usuário',
		example: 'João Silva',
		minLength: 2,
		maxLength: 100,
	})
	@IsString()
	@MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
	@MaxLength(100, { message: 'Nome não pode ter mais de 100 caracteres' })
	name: string;

	@ApiProperty({
		description: 'Email do usuário',
		example: 'joao@example.com',
	})
	@IsEmail({}, { message: 'Email inválido' })
	email: string;
}
