import { Injectable } from '@nestjs/common';
import { ITransactionRepository } from '../interfaces/i-transaction.repository';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { Transaction } from '../entities/transaction.entity';
import { TransactionCategory } from '../enums/transaction-category.enum';

@Injectable()
export class TransactionRepositoryImpl implements ITransactionRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(transaction: Transaction): Promise<Transaction> {
		const newTransaction = await this.prisma.transaction.create({
			data: {
				accountId: transaction.accountId,
				amount: transaction.amount,
				merchant: transaction.merchant,
				mcc: transaction.mcc,
				category: transaction.category,
			},
		});

		const category =
			TransactionCategory[
				newTransaction.category as keyof typeof TransactionCategory
			];

		return new Transaction(
			newTransaction.accountId!,
			Number(newTransaction.amount),
			newTransaction.merchant,
			String(newTransaction.mcc),
			category,
			newTransaction.id,
		);
	}
}
