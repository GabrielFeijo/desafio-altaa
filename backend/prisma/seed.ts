import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	await prisma.invite.deleteMany();
	await prisma.membership.deleteMany();
	await prisma.company.deleteMany();
	await prisma.user.deleteMany();

	const hashedPassword = await bcrypt.hash('desafio@altaa', 10);

	const user1 = await prisma.user.create({
		data: {
			email: 'owner@altaa.ai',
			name: 'João Silva',
			password: hashedPassword,
		},
	});

	const user2 = await prisma.user.create({
		data: {
			email: 'admin@altaa.ai',
			name: 'Maria Santos',
			password: hashedPassword,
		},
	});

	const user3 = await prisma.user.create({
		data: {
			email: 'member@altaa.ai',
			name: 'Pedro Oliveira',
			password: hashedPassword,
		},
	});

	const user4 = await prisma.user.create({
		data: {
			email: 'user@altaa.ai',
			name: 'Ana Costa',
			password: hashedPassword,
		},
	});

	const company1 = await prisma.company.create({
		data: {
			name: 'Altaa Tech',
			logo: 'https://placehold.co/150?text=Altaa+Tech',
		},
	});

	const company2 = await prisma.company.create({
		data: {
			name: 'Innovation Labs',
			logo: 'https://placehold.co/150?text=Innovation+Labs',
		},
	});

	const company3 = await prisma.company.create({
		data: {
			name: 'StartupXYZ',
			logo: 'https://placehold.co/150?text=StartupXYZ',
		},
	});

	await prisma.membership.create({
		data: {
			userId: user1.id,
			companyId: company1.id,
			role: Role.OWNER,
		},
	});

	await prisma.membership.create({
		data: {
			userId: user2.id,
			companyId: company1.id,
			role: Role.ADMIN,
		},
	});

	await prisma.membership.create({
		data: {
			userId: user3.id,
			companyId: company1.id,
			role: Role.MEMBER,
		},
	});

	await prisma.membership.create({
		data: {
			userId: user2.id,
			companyId: company2.id,
			role: Role.OWNER,
		},
	});

	await prisma.membership.create({
		data: {
			userId: user1.id,
			companyId: company2.id,
			role: Role.ADMIN,
		},
	});

	await prisma.membership.create({
		data: {
			userId: user4.id,
			companyId: company3.id,
			role: Role.OWNER,
		},
	});

	await prisma.user.update({
		where: { id: user1.id },
		data: { activeCompanyId: company1.id },
	});

	await prisma.user.update({
		where: { id: user2.id },
		data: { activeCompanyId: company1.id },
	});

	await prisma.user.update({
		where: { id: user3.id },
		data: { activeCompanyId: company1.id },
	});

	await prisma.user.update({
		where: { id: user4.id },
		data: { activeCompanyId: company3.id },
	});

	const token1 = `invite-${Date.now()}-1`;
	const token2 = `invite-${Date.now()}-2`;

	await prisma.invite.create({
		data: {
			email: 'newuser1@altaa.ai',
			token: token1,
			role: Role.MEMBER,
			companyId: company1.id,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		},
	});

	await prisma.invite.create({
		data: {
			email: 'newuser2@altaa.ai',
			token: token2,
			role: Role.ADMIN,
			companyId: company2.id,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		},
	});

	console.log('✨ Seed concluído com sucesso!');
}

main()
	.catch((e) => {
		console.error('❌ Erro ao executar seed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
