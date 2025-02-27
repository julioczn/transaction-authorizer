import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto, CreateAccountResponseDto } from './dtos/account.dto';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { AuthGuard } from '../auth/auth.guard';

@Controller('accounts')
@ApiTags('accounts')
@UseGuards(AuthGuard)
export class AccountController {
	constructor(private readonly createAccountUseCase: CreateAccountUseCase) {}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	@ApiResponse({
		type: CreateAccountResponseDto,
		description: 'Account created successfully',
	})
	async createAccount(@Body() account: CreateAccountDto) {
		return this.createAccountUseCase.execute(account);
	}
}
