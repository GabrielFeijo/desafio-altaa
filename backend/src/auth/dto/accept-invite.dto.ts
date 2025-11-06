import { ApiProperty } from '@nestjs/swagger';
import {
	IsString,
	IsEmail,
	MinLength,
	IsOptional,
	MaxLength,
} from 'class-validator';

export class AcceptInviteDto {
	@ApiProperty({
		description: 'Token único do convite recebido',
		example: 'invite-1234567890-1',
	})
	@IsString()
	token: string;

	@ApiProperty({
		description:
			'Email do novo usuário (obrigatório apenas se não estiver autenticado)',
		example: 'novousuario@example.com',
		required: false,
	})
	@IsOptional()
	@IsEmail({}, { message: 'Email inválido' })
	email?: string;

	@ApiProperty({
		description:
			'Senha do novo usuário (obrigatório apenas se não estiver autenticado)',
		example: 'senha123',
		minLength: 6,
		required: false,
	})
	@IsOptional()
	@IsString()
	@MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
	password?: string;

	@ApiProperty({
		description:
			'Nome do novo usuário (obrigatório apenas se não estiver autenticado)',
		example: 'Maria Santos',
		maxLength: 100,
		required: false,
	})
	@IsOptional()
	@IsString()
	@MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
	@MaxLength(100, { message: 'Nome não pode ter mais de 100 caracteres' })
	name?: string;
}
