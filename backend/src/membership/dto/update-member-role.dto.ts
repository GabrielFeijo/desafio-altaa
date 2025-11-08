import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateMemberRoleDto {
	@ApiProperty({
		description: 'Novo papel do membro',
		enum: Role,
		example: Role.ADMIN,
	})
	@IsEnum(Role, {
		message: 'Role deve ser OWNER, ADMIN ou MEMBER',
	})
	role: Role;
}
