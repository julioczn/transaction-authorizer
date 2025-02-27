import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITransactionRepository } from 'src/domain/interfaces/i-transaction.repository';
import { ProcessTransactionDto } from '../../infrastructure/controllers/dtos/transaction.dto';
import {
	ResponseCodeEnum,
	TransactionCategory,
} from '../../domain/enums/transaction-category.enum';
import { IAccountRepository } from '../../domain/interfaces/i-account.repository';
import { Account } from '../../domain/entities/account.entity';
import * as fuzz from 'fuzzball';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProcessTransactionUseCase {
	private readonly logger: Logger = new Logger(ProcessTransactionUseCase.name);
	private merchantListFood: string[] = [];
	private merchantListMeal: string[] = [];
	private merchantListCash: string[] = [];
	private trashold = 80;

	constructor(
		@Inject('ITransactionRepository')
		private readonly transactionRepository: ITransactionRepository,
		@Inject('IAccountRepository')
		private readonly accountRepository: IAccountRepository,
		private readonly configService: ConfigService,
	) {
		this.merchantListFood = this.configService
			.getOrThrow<string>('MERCHANT_LIST_FOOD')
			.split(',');
		this.merchantListMeal = this.configService
			.getOrThrow<string>('MERCHANT_LIST_MEAL')
			.split(',');
		this.merchantListCash = this.configService
			.getOrThrow<string>('MERCHANT_LIST_CASH')
			.split(',');
		this.trashold = this.configService.getOrThrow<number>('FUZZ_TRASHOLD');
	}

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

			return { code: ResponseCodeEnum.TRANSACTION_NOT_PERMITTED };
		}

		const fallbackResult = await this.processFallbackTransaction({
			accountData,
			account,
			amount,
			category,
			mcc,
			merchant,
			normalizedCategory,
			transactionDataInput: input,
		});

		if (fallbackResult) {
			return fallbackResult;
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

		return { code: ResponseCodeEnum.APPROVED };
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
		});
	}

	private async processFallbackTransaction({
		accountData,
		account,
		amount,
		category,
		mcc,
		merchant,
		normalizedCategory,
		transactionDataInput,
	}: {
		account: string;
		amount: number;
		mcc: string;
		merchant: string;
		category: TransactionCategory;
		normalizedCategory: string;
		accountData: Account;
		transactionDataInput: ProcessTransactionDto;
	}) {
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
					transactionDataInput,
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

				return { code: ResponseCodeEnum.APPROVED };
			}

			this.logger.error({
				message: 'Insufficient funds',
				transactionDataInput,
			});

			return { code: ResponseCodeEnum.INSUFFICIENT_FUNDS };
		}

		return null;
	}

	private mapMccToCategory(mcc: string, merchant: string): TransactionCategory {
		if (!merchant) {
			return TransactionCategory.CASH;
		}

		const categoryKeywords: Record<TransactionCategory, string[]> = {
			[TransactionCategory.FOOD]: this.merchantListFood,
			[TransactionCategory.MEAL]: this.merchantListMeal,
			[TransactionCategory.CASH]: this.merchantListCash,
		};

		const mccMapping: Record<string, TransactionCategory> = {
			'5411': TransactionCategory.FOOD,
			'5412': TransactionCategory.FOOD,
			'5811': TransactionCategory.MEAL,
			'5812': TransactionCategory.MEAL,
		};

		for (const [category, keywords] of Object.entries(categoryKeywords)) {
			const match = fuzz.extract(merchant.toLowerCase(), keywords, {
				scorer: fuzz.token_set_ratio,
			})[0];
			if (match[1] >= this.trashold) {
				return category as TransactionCategory;
			}
		}

		return mccMapping[mcc] || TransactionCategory.CASH;
	}

	private normalizeCategory(category: TransactionCategory): string {
		return (
			category.toLowerCase().charAt(0).toUpperCase() +
			category.toLowerCase().slice(1)
		);
	}
}
