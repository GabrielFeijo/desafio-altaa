import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SelectCompanyDto {
	@ApiProperty({
		description: 'ID da empresa a ser definida como ativa',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsUUID('4', { message: 'Company ID deve ser um UUID válido' })
	companyId: string;
}
