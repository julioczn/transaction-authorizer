export class Transaction {
	constructor(
		public readonly accountId: string,
		public readonly amount: number,
		public readonly merchant: string,
		public readonly mcc: string,
		public readonly category: 'FOOD' | 'MEAL' | 'CASH',
		public readonly status: 'APPROVED' | 'REJECTED',
	) {}
}
