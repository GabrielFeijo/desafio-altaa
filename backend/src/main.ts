import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		})
	);

	app.use(cookieParser());

	const config = new DocumentBuilder()
		.setTitle('Altaa.ai API')
		.setDescription(
			'API Multi-tenant para gerenciamento de empresas e usuários'
		)
		.setVersion('1.0')
		.addTag('auth', 'Endpoints de autenticação')
		.addTag('company', 'Endpoints de gerenciamento de empresas')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'JWT',
				description: 'Token JWT no cookie httpOnly',
				in: 'cookie',
			},
			'JWT-auth'
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);
	SwaggerModule.setup('api/docs', app, document, {
		customSiteTitle: 'Altaa.ai API',
		customJs: [
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
		],
		customCssUrl: [
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
			'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
		],
	});

	app.enableCors({
		origin: true,
		credentials: true,
	});

	const port = process.env.PORT || 3333;
	await app.listen(port);
}

bootstrap();
