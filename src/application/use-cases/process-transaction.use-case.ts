import { Injectable } from '@nestjs/common';
import { ITransactionRepository } from 'src/domain/interfaces/i-transaction.repository';
import { ProcessTransactionDto } from '../dtos/process-transaction.dto';

@Injectable()
export class ProcessTransactionUseCase {
	constructor(private readonly transactionRepository: ITransactionRepository) {}

	// TODO: remove eslint-disable-next-line
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async execute(input: ProcessTransactionDto) {
		// TODO: Implement use case
	}
}
