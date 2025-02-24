import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProcessTransactionDto } from 'src/application/dtos/process-transaction.dto';
import { CreateTransactionResponseDto } from './response.dto';

@Controller('transactions')
@ApiTags('transactions')
export class TransactionController {
	constructor() {}

	@Post('/')
	@HttpCode(200)
	@ApiResponse({
		type: CreateTransactionResponseDto,
		description: 'Transaction created successfully',
	})
	// TODO: remove eslint-disable-next-line
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	createTransaction(@Body() transaction: ProcessTransactionDto) {
		// TODO: Implement controller
	}
}
