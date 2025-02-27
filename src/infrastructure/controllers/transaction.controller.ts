/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	CreateTransactionResponseDto,
	ProcessTransactionDto,
} from './dtos/transaction.dto';
import { ProcessTransactionUseCase } from '../../application/use-cases/process-transaction.use-case';
import { ResponseCodeEnum } from '../../domain/enums/transaction-category.enum';

@Controller('transactions')
@ApiTags('transactions')
export class TransactionController {
	private readonly logger: Logger = new Logger(TransactionController.name);
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
		const retries = 3;
		for (let attempt = 0; attempt < retries; attempt++) {
			try {
				return this.processTransactionUseCase.execute(transaction);
			} catch (err: any) {
				if (
					err.message.includes('Optimistic locking conflict') &&
					attempt < retries
				) {
					this.logger.warn({
						message: 'Optimistic locking conflict, retrying',
						err,
						transaction,
					});
				} else {
					return { code: ResponseCodeEnum.TRANSACTION_NOT_PERMITTED };
				}
			}
		}
	}
}
