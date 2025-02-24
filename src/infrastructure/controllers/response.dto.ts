import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

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
