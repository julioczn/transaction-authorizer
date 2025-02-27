import { createZodDto } from '@anatine/zod-nestjs';
import { extendZodWithOpenApi } from '@anatine/zod-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const CreateAccountSchema = z.object({
	balanceFood: z
		.number()
		.positive('balanceFood must be greater than 0')
		.openapi({ example: 100.0 }),
	balanceMeal: z
		.number()
		.positive('balanceMeal must be greater than 0')
		.openapi({ example: 100.0 }),
	balanceCash: z
		.number()
		.positive('balanceCash must be greater than 0')
		.openapi({ example: 100.0 }),
});

export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}

export const CreateAccountResponse = z.object({
	accountId: z.string(),
});

export class CreateAccountResponseDto extends createZodDto(
	CreateAccountResponse,
) {}
