import { Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/database/prisma/prisma.service';
import { TransactionRepositoryImpl } from './domain/repositories/transaction.repository';
import { TransactionController } from './infrastructure/controllers/transaction.controller';

@Module({
	imports: [],
	controllers: [TransactionController],
	providers: [
		PrismaService,
		{
			provide: 'ITransactionRepository',
			useClass: TransactionRepositoryImpl,
		},
	],
})
export class AppModule {}
