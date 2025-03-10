import { Injectable } from '@nestjs/common';
import { IAccountRepository } from '../interfaces/i-account.repository';
import { Account } from '../entities/account.entity';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { Account as PrismaAccount } from 'prisma/prisma-client';

@Injectable()
export class AccountRepositoryImpl implements IAccountRepository {
	constructor(private readonly prisma: PrismaService) {}

	async updateBalance(
		accountId: string,
		category: string,
		amount: number,
		version: number,
	): Promise<void> {
		const result = await this.prisma.account.updateMany({
			where: { id: accountId, version: version },
			data: {
				[`balance${category}`]: {
					decrement: amount,
				},
				version: {
					increment: 1,
				},
			},
		});

		if (result.count === 0) {
			throw new Error('Optimistic locking conflict: Transaction aborted');
		}
	}

	async create(
		accountId: string,
		balanceFood?: number,
		balanceMeal?: number,
		balanceCash?: number,
	): Promise<Account> {
		const account = await this.prisma.account.create({
			data: {
				id: accountId,
				balanceFood: balanceFood || 0,
				balanceMeal: balanceMeal || 0,
				balanceCash: balanceCash || 0,
			},
		});

		return this.buildAccount(account);
	}

	async findByAccountId(accountId: string): Promise<Account> {
		const account = await this.prisma.account.findUnique({
			where: {
				id: accountId,
			},
		});

		if (!account) {
			throw new Error('Account not found');
		}

		return this.buildAccount(account);
	}

	private buildAccount(account: PrismaAccount): Account {
		return new Account(
			account.id,
			Number(account.balanceFood),
			Number(account.balanceMeal),
			Number(account.balanceCash),
			Number(account.version),
		);
	}
}
