import { Account } from '../entities/account.entity';

export interface IAccountRepository {
	updateBalance(
		accountId: string,
		category: string,
		amount: number,
	): Promise<void>;
	create(
		accountId: string,
		balanceFood?: number,
		balanceMeal?: number,
		balanceCash?: number,
	): Promise<Account>;
	findByAccountId(accountId: string): Promise<Account>;
}
