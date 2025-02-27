import {
	createAccountMock,
	prisma,
	resetDatabase,
} from '../../../test/database';
import { ProcessTransactionUseCase } from './process-transaction.use-case';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { TransactionRepositoryImpl } from '../../domain/repositories/transaction.repository';
import { AccountRepositoryImpl } from '../../domain/repositories/account.repository';
import {
	ResponseCodeEnum,
	TransactionCategory,
} from '../../domain/enums/transaction-category.enum';
import { ConfigService } from '@nestjs/config';

describe(ProcessTransactionUseCase.name, () => {
	const prismaService = prisma as PrismaService;
	const transactionRepository = new TransactionRepositoryImpl(prismaService);
	const accountRepository = new AccountRepositoryImpl(prismaService);
	const configService = {
		getOrThrow: jest.fn((key: never) => {
			const config = {
				MERCHANT_LIST_FOOD:
					'supermercado,market,mercearia,hortifruti,padaria,bakery,grocery,food',
				MERCHANT_LIST_MEAL:
					'restaurante,bar,cafe,lanchonete,pizza,pizzaria,burger,hamburgueria,fast food,snack,bistro,grill,eatery,ifood',
				MERCHANT_LIST_CASH: 'atm,saque,withdraw',
				FUZZ_TRASHOLD: 80,
			};
			return config[key] || key;
		}),
	} as unknown as ConfigService;
	const useCase = new ProcessTransactionUseCase(
		transactionRepository,
		accountRepository,
		configService,
	);

	afterEach(async () => {
		await resetDatabase();
	});

	it('should process a transaction with success', async () => {
		const account = await createAccountMock(100, 100, 0);
		const input = {
			account: account.id,
			amount: 100,
			mcc: '5811',
			merchant: 'UBER EATS',
		};

		const result = await useCase.execute(input);
		const accountData = await prismaService.account.findUnique({
			where: { id: account.id },
		});

		const transactionData = await prismaService.transaction.findFirst({
			where: { accountId: account.id },
		});

		expect(result).toEqual({ code: ResponseCodeEnum.APPROVED });
		expect(Number(accountData?.balanceCash)).toBe(0);
		expect(Number(accountData?.balanceFood)).toBe(100);
		expect(Number(accountData?.balanceMeal)).toBe(0);

		expect(transactionData?.accountId).toBe(account.id);
		expect(Number(transactionData?.amount)).toBe(input.amount);
		expect(transactionData?.merchant).toBe(input.merchant);
		expect(transactionData?.mcc).toBe(input.mcc);
		expect(transactionData?.category).toBe(TransactionCategory.MEAL);
	});

	it('should process a transaction fallback with success', async () => {
		const account = await createAccountMock(100, 0, 200);
		const input = {
			account: account.id,
			amount: 100,
			mcc: '5811',
			merchant: 'Restaurant',
		};

		const result = await useCase.execute(input);
		const accountData = await prismaService.account.findUnique({
			where: { id: account.id },
		});

		const transactionData = await prismaService.transaction.findFirst({
			where: { accountId: account.id },
		});

		expect(result).toEqual({ code: ResponseCodeEnum.APPROVED });
		expect(Number(accountData?.balanceCash)).toBe(100);
		expect(Number(accountData?.balanceFood)).toBe(100);
		expect(Number(accountData?.balanceMeal)).toBe(0);

		expect(transactionData?.accountId).toBe(account.id);
		expect(Number(transactionData?.amount)).toBe(input.amount);
		expect(transactionData?.merchant).toBe(input.merchant);
		expect(transactionData?.mcc).toBe(input.mcc);
		expect(transactionData?.category).toBe(TransactionCategory.CASH);
	});

	it('should process a transaction with invalid account', async () => {
		const input = {
			account: 'invalid-account',
			amount: 100,
			mcc: '5811',
			merchant: 'UBER EATS',
		};

		await expect(useCase.execute(input)).resolves.toEqual({
			code: ResponseCodeEnum.TRANSACTION_NOT_PERMITTED,
		});
	});

	it('should process a transaction with invalid mcc but with valid merchant', async () => {
		const account = await createAccountMock(100, 100, 100);
		const input = {
			account: account.id,
			amount: 100,
			mcc: 'invalid-mcc',
			merchant: 'IFOOD',
		};

		await expect(useCase.execute(input)).resolves.toEqual({
			code: ResponseCodeEnum.APPROVED,
		});

		const accountData = await prismaService.account.findUnique({
			where: { id: account.id },
		});

		const transactionData = await prismaService.transaction.findFirst({
			where: { accountId: account.id },
		});

		expect(Number(accountData?.balanceFood)).toBe(0);

		expect(transactionData?.accountId).toBe(account.id);
		expect(Number(transactionData?.amount)).toBe(input.amount);
		expect(transactionData?.merchant).toBe(input.merchant);
		expect(transactionData?.mcc).toBe(input.mcc);
		expect(transactionData?.category).toBe(TransactionCategory.FOOD);
	});

	it('should try to process a transaction with insufficient balance', async () => {
		const account = await createAccountMock(100, 100, 100);
		const input = {
			account: account.id,
			amount: 200,
			mcc: '5811',
			merchant: 'UBER EATS',
		};

		await expect(useCase.execute(input)).resolves.toEqual({
			code: ResponseCodeEnum.INSUFFICIENT_FUNDS,
		});
	});
});
