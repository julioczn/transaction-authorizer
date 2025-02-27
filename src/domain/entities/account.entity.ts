export class Account {
	constructor(
		public readonly id: string,
		public balanceFood: number,
		public balanceMeal: number,
		public balanceCash: number,
		public version: number,
	) {}

	hasSufficientBalance(amount: number, category: string) {
		return this[`balance${category}`] >= amount;
	}

	debit(amount: number, category: string) {
		this[`balance${category}`] -= amount;
	}
}
