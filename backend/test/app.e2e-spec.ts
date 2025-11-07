import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import cookieParser from 'cookie-parser';
import request from 'supertest';

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let prisma: PrismaService;

	let userToken: string;
	let user2Token: string;
	let userId: string;
	let user2Id: string;
	let user3Id: string;
	let companyId: string;
	let company2Id: string;
	let inviteToken: string;
	let inviteId: string;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
			})
		);
		app.use(cookieParser());

		await app.init();

		prisma = app.get<PrismaService>(PrismaService);
	});

	afterAll(async () => {
		await prisma.invite.delete({ where: { id: inviteId } });
		await prisma.membership.deleteMany({ where: { companyId } });
		await prisma.membership.deleteMany({ where: { companyId: company2Id } });
		await prisma.company.delete({ where: { id: companyId } });
		await prisma.company.delete({ where: { id: company2Id } });
		await prisma.user.delete({ where: { id: userId } });
		await prisma.user.delete({ where: { id: user2Id } });
		await prisma.user.delete({ where: { id: user3Id } });

		await app.close();
	});

	describe('Authentication', () => {
		describe('/auth/signup (POST)', () => {
			it('deve criar um novo usuário', () => {
				return request(app.getHttpServer())
					.post('/auth/signup')
					.send({
						email: 'test@example.com',
						password: 'senha123',
						name: 'Test User',
					})
					.expect(201)
					.expect((res) => {
						expect(res.body.user).toBeDefined();
						expect(res.body.user.email).toBe('test@example.com');
						expect(res.body.user.name).toBe('Test User');
						expect(res.headers['set-cookie']).toBeDefined();

						const cookies = Array.isArray(res.headers['set-cookie'])
							? res.headers['set-cookie']
							: ([res.headers['set-cookie']].filter(Boolean) as string[]);
						const tokenCookie = cookies.find((c: string) =>
							c.startsWith('token=')
						);
						userToken = tokenCookie.split(';')[0].split('=')[1];
						userId = res.body.user.id;
					});
			});

			it('não deve criar usuário com email duplicado', () => {
				return request(app.getHttpServer())
					.post('/auth/signup')
					.send({
						email: 'test@example.com',
						password: 'senha123',
						name: 'Test User 2',
					})
					.expect(409);
			});

			it('não deve criar usuário com email inválido', () => {
				return request(app.getHttpServer())
					.post('/auth/signup')
					.send({
						email: 'invalid-email',
						password: 'senha123',
						name: 'Test User',
					})
					.expect(400);
			});

			it('não deve criar usuário com senha curta', () => {
				return request(app.getHttpServer())
					.post('/auth/signup')
					.send({
						email: 'test2@example.com',
						password: '123',
						name: 'Test User',
					})
					.expect(400);
			});
		});

		describe('/auth/login (POST)', () => {
			it('deve fazer login com credenciais válidas', () => {
				return request(app.getHttpServer())
					.post('/auth/login')
					.send({
						email: 'test@example.com',
						password: 'senha123',
					})
					.expect(200)
					.expect((res) => {
						expect(res.body.user).toBeDefined();
						expect(res.body.user.email).toBe('test@example.com');
						expect(res.headers['set-cookie']).toBeDefined();
					});
			});

			it('não deve fazer login com senha incorreta', () => {
				return request(app.getHttpServer())
					.post('/auth/login')
					.send({
						email: 'test@example.com',
						password: 'senhaerrada',
					})
					.expect(401);
			});

			it('não deve fazer login com email inexistente', () => {
				return request(app.getHttpServer())
					.post('/auth/login')
					.send({
						email: 'naoexiste@example.com',
						password: 'senha123',
					})
					.expect(401);
			});
		});

		describe('/auth/me (POST)', () => {
			it('deve retornar dados do usuário autenticado', () => {
				return request(app.getHttpServer())
					.post('/auth/me')
					.set('Cookie', [`token=${userToken}`])
					.expect(200)
					.expect((res) => {
						expect(res.body.userId).toBe(userId);
					});
			});

			it('não deve retornar dados sem autenticação', () => {
				return request(app.getHttpServer()).post('/auth/me').expect(401);
			});
		});

		describe('/auth/logout (POST)', () => {
			it('deve fazer logout', () => {
				return request(app.getHttpServer())
					.post('/auth/logout')
					.set('Cookie', [`token=${userToken}`])
					.expect(200);
			});
		});
	});

	describe('Companies', () => {
		beforeAll(async () => {
			const res = await request(app.getHttpServer()).post('/auth/login').send({
				email: 'test@example.com',
				password: 'senha123',
			});

			const cookies = Array.isArray(res.headers['set-cookie'])
				? res.headers['set-cookie']
				: ([res.headers['set-cookie']].filter(Boolean) as string[]);
			const tokenCookie = cookies.find((c: string) => c.startsWith('token='));
			userToken = tokenCookie.split(';')[0].split('=')[1];
		});

		describe('/company (POST)', () => {
			it('deve criar uma nova empresa', () => {
				return request(app.getHttpServer())
					.post('/company')
					.set('Cookie', [`token=${userToken}`])
					.send({
						name: 'Test Company',
						logo: 'https://example.com/logo.png',
					})
					.expect(201)
					.expect((res) => {
						expect(res.body.company).toBeDefined();
						expect(res.body.company.name).toBe('Test Company');
						expect(res.body.company.role).toBe(Role.OWNER);
						companyId = res.body.company.id;
					});
			});

			it('não deve criar empresa sem autenticação', () => {
				return request(app.getHttpServer())
					.post('/company')
					.send({
						name: 'Test Company 2',
					})
					.expect(401);
			});

			it('não deve criar empresa com nome curto', () => {
				return request(app.getHttpServer())
					.post('/company')
					.set('Cookie', [`token=${userToken}`])
					.send({
						name: 'T',
					})
					.expect(400);
			});
		});

		describe('/companies (GET)', () => {
			it('deve listar empresas do usuário', () => {
				return request(app.getHttpServer())
					.get('/companies')
					.set('Cookie', [`token=${userToken}`])
					.expect(200)
					.expect((res) => {
						expect(res.body.data).toBeDefined();
						expect(Array.isArray(res.body.data)).toBe(true);
						expect(res.body.data.length).toBeGreaterThan(0);
						expect(res.body.meta).toBeDefined();
						expect(res.body.meta.total).toBeGreaterThan(0);
					});
			});

			it('deve paginar empresas', () => {
				return request(app.getHttpServer())
					.get('/companies?page=1&limit=5')
					.set('Cookie', [`token=${userToken}`])
					.expect(200)
					.expect((res) => {
						expect(res.body.meta.page).toBe(1);
						expect(res.body.meta.limit).toBe(5);
					});
			});

			it('não deve listar empresas sem autenticação', () => {
				return request(app.getHttpServer()).get('/companies').expect(401);
			});
		});

		describe('/company/:id/select (POST)', () => {
			it('deve selecionar empresa ativa', () => {
				return request(app.getHttpServer())
					.post(`/company/${companyId}/select`)
					.set('Cookie', [`token=${userToken}`])
					.expect(200)
					.expect((res) => {
						expect(res.body.company).toBeDefined();
						expect(res.body.company.id).toBe(companyId);
					});
			});

			it('não deve selecionar empresa que não é membro', async () => {
				const res = await request(app.getHttpServer())
					.post('/auth/signup')
					.send({
						email: 'test2@example.com',
						password: 'senha123',
						name: 'Test User 2',
					});

				const cookies = Array.isArray(res.headers['set-cookie'])
					? res.headers['set-cookie']
					: ([res.headers['set-cookie']].filter(Boolean) as string[]);
				const tokenCookie = cookies.find((c: string) => c.startsWith('token='));
				user2Token = tokenCookie.split(';')[0].split('=')[1];
				user2Id = res.body.user.id;

				const res2 = await request(app.getHttpServer())
					.post('/company')
					.set('Cookie', [`token=${user2Token}`])
					.send({
						name: 'Test Company 2',
					});

				company2Id = res2.body.company.id;

				return request(app.getHttpServer())
					.post(`/company/${company2Id}/select`)
					.set('Cookie', [`token=${userToken}`])
					.expect(404);
			});
		});

		describe('/company/:id (GET)', () => {
			it('deve buscar detalhes da empresa', () => {
				return request(app.getHttpServer())
					.get(`/company/${companyId}`)
					.set('Cookie', [`token=${userToken}`])
					.expect(200)
					.expect((res) => {
						expect(res.body.id).toBe(companyId);
						expect(res.body.name).toBe('Test Company');
						expect(res.body.members).toBeDefined();
						expect(Array.isArray(res.body.members)).toBe(true);
					});
			});

			it('não deve buscar empresa que não é membro', () => {
				return request(app.getHttpServer())
					.get(`/company/${company2Id}`)
					.set('Cookie', [`token=${userToken}`])
					.expect(403);
			});
		});
	});

	describe('Invites', () => {
		describe('/company/:id/invite (POST)', () => {
			it('deve criar convite como OWNER', () => {
				return request(app.getHttpServer())
					.post(`/company/${companyId}/invite`)
					.set('Cookie', [`token=${userToken}`])
					.send({
						email: 'newuser@example.com',
						role: Role.MEMBER,
					})
					.expect(201)
					.expect((res) => {
						expect(res.body.invite).toBeDefined();
						expect(res.body.invite.email).toBe('newuser@example.com');
						expect(res.body.invite.role).toBe(Role.MEMBER);
						expect(res.body.invite.token).toBeDefined();
						inviteToken = res.body.invite.token;
						inviteId = res.body.invite.id;
					});
			});

			it('não deve criar convite com email inválido', () => {
				return request(app.getHttpServer())
					.post(`/company/${companyId}/invite`)
					.set('Cookie', [`token=${userToken}`])
					.send({
						email: 'invalid-email',
						role: Role.MEMBER,
					})
					.expect(400);
			});

			it('não deve criar convite com role inválido', () => {
				return request(app.getHttpServer())
					.post(`/company/${companyId}/invite`)
					.set('Cookie', [`token=${userToken}`])
					.send({
						email: 'newuser2@example.com',
						role: 'INVALID_ROLE',
					})
					.expect(400);
			});

			it('não deve criar convite para membro existente', () => {
				return request(app.getHttpServer())
					.post(`/company/${companyId}/invite`)
					.set('Cookie', [`token=${userToken}`])
					.send({
						email: 'test@example.com',
						role: Role.MEMBER,
					})
					.expect(409);
			});
		});

		describe('/company/:id/invites (GET)', () => {
			it('deve listar convites pendentes', () => {
				return request(app.getHttpServer())
					.get(`/company/${companyId}/invites`)
					.set('Cookie', [`token=${userToken}`])
					.expect(200)
					.expect((res) => {
						expect(res.body.invites).toBeDefined();
						expect(Array.isArray(res.body.invites)).toBe(true);
						expect(res.body.invites.length).toBeGreaterThan(0);
					});
			});

			it('não deve listar convites de empresa que não é membro', () => {
				return request(app.getHttpServer())
					.get(`/company/${company2Id}/invites`)
					.set('Cookie', [`token=${userToken}`])
					.expect(403);
			});
		});

		describe('/auth/accept-invite (POST)', () => {
			it('deve aceitar convite e criar novo usuário', () => {
				return request(app.getHttpServer())
					.post('/auth/accept-invite')
					.send({
						token: inviteToken,
						email: 'newuser@example.com',
						password: 'senha123',
						name: 'New User',
					})
					.expect(200)
					.expect((res) => {
						expect(res.body.user).toBeDefined();
						expect(res.body.user.email).toBe('newuser@example.com');
						expect(res.body.company).toBeDefined();
						expect(res.body.company.id).toBe(companyId);
						expect(res.headers['set-cookie']).toBeDefined();
						user3Id = res.body.user.id;
					});
			});

			it('não deve aceitar convite com token inválido', () => {
				return request(app.getHttpServer())
					.post('/auth/accept-invite')
					.send({
						token: 'invalid-token',
						email: 'test3@example.com',
						password: 'senha123',
						name: 'Test User 3',
					})
					.expect(404);
			});

			it('não deve aceitar convite já aceito', () => {
				return request(app.getHttpServer())
					.post('/auth/accept-invite')
					.send({
						token: inviteToken,
						email: 'newuser@example.com',
						password: 'senha123',
						name: 'New User',
					})
					.expect(400);
			});
		});

		describe('/company/:companyId/invite/:inviteId (DELETE)', () => {
			it('deve cancelar convite como OWNER', async () => {
				const res = await request(app.getHttpServer())
					.post(`/company/${companyId}/invite`)
					.set('Cookie', [`token=${userToken}`])
					.send({
						email: 'tocancel@example.com',
						role: Role.MEMBER,
					});

				const inviteToCancel = res.body.invite.id;

				return request(app.getHttpServer())
					.delete(`/company/${companyId}/invite/${inviteToCancel}`)
					.set('Cookie', [`token=${userToken}`])
					.expect(200);
			});

			it('não deve cancelar convite de outra empresa', () => {
				return request(app.getHttpServer())
					.delete(`/company/${company2Id}/invite/${inviteId}`)
					.set('Cookie', [`token=${userToken}`])
					.expect(403);
			});
		});
	});

	describe('Validation', () => {
		it('deve rejeitar campos extras no body', () => {
			return request(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: 'test4@example.com',
					password: 'senha123',
					name: 'Test User 4',
					extraField: 'not allowed',
				})
				.expect(400);
		});

		it('deve rejeitar campos faltando', () => {
			return request(app.getHttpServer())
				.post('/auth/signup')
				.send({
					email: 'test5@example.com',
					name: 'Test User 5',
				})
				.expect(400);
		});
	});
});
