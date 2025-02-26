import { Injectable, Logger } from '@nestjs/common';
import { ITransactionRepository } from 'src/domain/interfaces/i-transaction.repository';
import { ProcessTransactionDto } from '../../infrastructure/controllers/dtos/process-transaction.dto';
import { TransactionCategory } from '../../domain/enums/transaction-category.enum';
import { IAccountRepository } from '../../domain/interfaces/i-account.repository';
import { Account } from '../../domain/entities/account.entity';

@Injectable()
export class ProcessTransactionUseCase {
	private readonly logger: Logger = new Logger(ProcessTransactionUseCase.name);
	constructor(
		private readonly transactionRepository: ITransactionRepository,
		private readonly accountRepository: IAccountRepository,
	) {}

	async execute(input: ProcessTransactionDto) {
		const { account, amount, mcc, merchant } = input;

		const category = this.mapMccToCategory(mcc, merchant);
		const normalizedCategory = this.normalizeCategory(category);

		let accountData: Account;
		try {
			accountData = await this.accountRepository.findByAccountId(account);
		} catch (err: unknown) {
			this.logger.error({
				message: 'Account not found',
				err,
				input,
			});

			return { code: '07' };
		}

		if (!accountData.hasSufficientBalance(amount, normalizedCategory)) {
			const cashCategoryNormalized = this.normalizeCategory(
				TransactionCategory.CASH,
			);
			if (
				category !== TransactionCategory.CASH &&
				accountData.hasSufficientBalance(amount, cashCategoryNormalized)
			) {
				this.logger.log({
					message: 'Insufficient funds in category, using cash',
					input,
				});

				await this.processTransaction({
					accountData,
					account,
					amount,
					category: TransactionCategory.CASH,
					mcc,
					merchant,
					normalizedCategory: cashCategoryNormalized,
				});

				return { code: '00' };
			} else {
				this.logger.error({
					message: 'Insufficient funds',
					input,
				});

				return { code: '51' };
			}
		}

		await this.processTransaction({
			accountData,
			account,
			amount,
			category,
			mcc,
			merchant,
			normalizedCategory,
		});

		return { code: '00' };
	}

	private async processTransaction({
		account,
		amount,
		mcc,
		merchant,
		category,
		normalizedCategory,
		accountData,
	}: {
		account: string;
		amount: number;
		mcc: string;
		merchant: string;
		category: TransactionCategory;
		normalizedCategory: string;
		accountData: Account;
	}) {
		accountData.debit(amount, normalizedCategory);
		await this.accountRepository.updateBalance(
			account,
			normalizedCategory,
			amount,
		);

		await this.transactionRepository.create({
			accountId: account,
			amount,
			mcc,
			merchant,
			category,
			status: 'APPROVED',
		});
	}

	private mapMccToCategory(mcc: string, merchant: string): TransactionCategory {
		const foodRegex =
			/\b(supermercado|market|mercearia|hortifruti|padaria|bakery|grocery|food)\b/i;
		const mealRegex =
			/\b(restaurante|bar|cafe|lanchonete|pizza|pizzaria|burger|hamburgueria|fast food|snack|bistro|grill|eatery)\b/i;

		if (foodRegex.test(merchant)) {
			return TransactionCategory.FOOD;
		}

		if (mealRegex.test(merchant)) {
			return TransactionCategory.MEAL;
		}

		const mccMapping: Record<string, TransactionCategory> = {
			'5411': TransactionCategory.FOOD,
			'5412': TransactionCategory.FOOD,
			'5811': TransactionCategory.MEAL,
			'5812': TransactionCategory.MEAL,
		};

		return mccMapping[mcc] || TransactionCategory.CASH;
	}

	private normalizeCategory(category: TransactionCategory): string {
		return (
			category.toLowerCase().charAt(0).toUpperCase() +
			category.toLowerCase().slice(1)
		);
	}
}
