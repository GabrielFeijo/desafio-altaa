import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateInviteDto {
	@ApiProperty({
		description: 'Email do usuário a ser convidado',
		example: 'novousuario@example.com',
	})
	@IsEmail({}, { message: 'Email inválido' })
	email: string;

	@ApiProperty({
		description: 'Papel que o usuário terá na empresa',
		enum: Role,
		example: Role.MEMBER,
	})
	@IsEnum(Role, {
		message: 'Role deve ser OWNER, ADMIN ou MEMBER',
	})
	role: Role;
}
