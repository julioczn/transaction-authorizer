import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

export const prisma = new PrismaClient();

export async function resetDatabase() {
	await prisma.$transaction([
		prisma.transaction.deleteMany(),
		prisma.account.deleteMany(),
	]);
}

export async function createAccountMock(
	balanceFood = 100,
	balanceMeal = 100,
	balanceCash = 100,
) {
	const account = await prisma.account.create({
		data: {
			id: randomUUID(),
			balanceFood,
			balanceMeal,
			balanceCash,
		},
	});

	return account;
}
