import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	CreateTransactionResponseDto,
	ProcessTransactionDto,
} from './dtos/transaction.dto';
import { ProcessTransactionUseCase } from '../../application/use-cases/process-transaction.use-case';

@Controller('transactions')
@ApiTags('transactions')
export class TransactionController {
	constructor(
		private readonly processTransactionUseCase: ProcessTransactionUseCase,
	) {}

	@Post('/')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		type: CreateTransactionResponseDto,
		description: 'Transaction created successfully',
	})
	async createTransaction(@Body() transaction: ProcessTransactionDto) {
		return this.processTransactionUseCase.execute(transaction);
	}
}
