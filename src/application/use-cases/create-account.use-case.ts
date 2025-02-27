import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IAccountRepository } from '../../domain/interfaces/i-account.repository';
import { CreateAccountDto } from '../../infrastructure/controllers/dtos/account.dto';

export class CreateAccountUseCase {
	private readonly logger: Logger = new Logger(CreateAccountUseCase.name);

	constructor(
		@Inject('IAccountRepository')
		private readonly accountRepository: IAccountRepository,
	) {}

	async execute(input: CreateAccountDto) {
		const { balanceCash, balanceFood, balanceMeal } = input;

		try {
			const account = await this.accountRepository.create(
				randomUUID(),
				balanceFood,
				balanceMeal,
				balanceCash,
			);

			return { accountId: account.id };
		} catch (err: unknown) {
			this.logger.error({
				message: 'Failed to create account',
				err,
				input,
			});

			throw new BadRequestException('Failed to create account');
		}
	}
}
