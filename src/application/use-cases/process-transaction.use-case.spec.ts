import {
	createAccountMock,
	prisma,
	resetDatabase,
} from '../../../test/database';
import { ProcessTransactionUseCase } from './process-transaction.use-case';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { TransactionRepositoryImpl } from '../../domain/repositories/transaction.repository';
import { AccountRepositoryImpl } from '../../domain/repositories/account.repository';
import { TransactionCategory } from '../../domain/enums/transaction-category.enum';

describe(ProcessTransactionUseCase.name, () => {
	const prismaService = prisma as PrismaService;
	const transactionRepository = new TransactionRepositoryImpl(prismaService);
	const accountRepository = new AccountRepositoryImpl(prismaService);
	const useCase = new ProcessTransactionUseCase(
		transactionRepository,
		accountRepository,
	);

	afterEach(async () => {
		await resetDatabase();
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

		expect(result).toEqual({ code: '00' });
		expect(Number(accountData?.balanceCash)).toBe(100);
		expect(Number(accountData?.balanceFood)).toBe(100);
		expect(Number(accountData?.balanceMeal)).toBe(0);

		expect(transactionData?.accountId).toBe(account.id);
		expect(Number(transactionData?.amount)).toBe(100);
		expect(transactionData?.merchant).toBe('Restaurant');
		expect(transactionData?.mcc).toBe('5811');
		expect(transactionData?.category).toBe(TransactionCategory.CASH);
	});
});
