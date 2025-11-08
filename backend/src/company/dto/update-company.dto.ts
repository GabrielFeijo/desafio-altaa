import { ApiProperty } from '@nestjs/swagger';
import {
	IsString,
	MinLength,
	MaxLength,
	IsOptional,
	IsUrl,
} from 'class-validator';

export class UpdateCompanyDto {
	@ApiProperty({
		description: 'Nome da empresa',
		example: 'Minha Empresa Tech Atualizada',
		minLength: 2,
		maxLength: 100,
	})
	@IsString()
	@MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
	@MaxLength(100, { message: 'Nome não pode ter mais de 100 caracteres' })
	name: string;

	@ApiProperty({
		description: 'URL do logotipo da empresa (opcional)',
		example: 'https://example.com/new-logo.png',
		required: false,
	})
	@IsOptional()
	@IsUrl({}, { message: 'Logo deve ser uma URL válida' })
	logo?: string;
}
