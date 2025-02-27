import { TransactionCategory } from '../enums/transaction-category.enum';

export class Transaction {
	constructor(
		public readonly accountId: string,
		public readonly amount: number,
		public readonly merchant: string,
		public readonly mcc: string,
		public readonly category: TransactionCategory,
		public readonly id?: string,
	) {}
}
