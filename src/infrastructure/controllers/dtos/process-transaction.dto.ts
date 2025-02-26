import { createZodDto } from '@anatine/zod-nestjs';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const ProcessTransactionSchema = z.object({
	account: z
		.string()
		.min(1, 'Account is required')
		.max(20)
		.openapi({ example: '123' }),
	amount: z
		.number()
		.positive('Amount must be greater than 0')
		.openapi({ example: 100.0 }),
	mcc: z
		.string()
		.length(4, 'MCC must be a 4-digit code')
		.openapi({ example: '5811' }),
	merchant: z
		.string()
		.min(1, 'Merchant is required')
		.max(100)
		.openapi({ example: 'PADARIA DO ZE               SAO PAULO BR' }),
});

export class ProcessTransactionDto extends createZodDto(
	ProcessTransactionSchema,
) {}

enum responseCodeEnum {
	APPROVED = '00',
	INSUFFICIENT_FUNDS = '51',
	TRANSACTION_NOT_PERMITTED = '07',
}

const createTransactionResponse = z.object({
	code: z.nativeEnum(responseCodeEnum),
});

export class CreateTransactionResponseDto extends createZodDto(
	createTransactionResponse,
) {}
