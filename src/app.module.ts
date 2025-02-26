import { Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/database/prisma/prisma.service';
import { TransactionRepositoryImpl } from './domain/repositories/transaction.repository';
import { TransactionController } from './infrastructure/controllers/transaction.controller';
import { ConfigModule } from '@nestjs/config';
import { AccountRepositoryImpl } from './domain/repositories/account.repository';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate: (config) => {
				if ('NODE_CONFIG' in config) {
					return {
						...JSON.parse(config.NODE_CONFIG as string),
						...config,
					} as Record<string, any>;
				}
				return config;
			},
		}),
	],
	controllers: [TransactionController],
	providers: [
		PrismaService,
		{
			provide: 'ITransactionRepository',
			useClass: TransactionRepositoryImpl,
		},
		{
			provide: 'IAccountRepository',
			useClass: AccountRepositoryImpl,
		},
	],
})
export class AppModule {}
