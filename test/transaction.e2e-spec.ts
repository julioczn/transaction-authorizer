import { TransactionController } from '../src/infrastructure/controllers/transaction.controller';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { ResponseCodeEnum } from '../src/domain/enums/transaction-category.enum';
import { createAccountMock } from './database';

describe(TransactionController.name, () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/transactions (POST)', async () => {
		const account = await createAccountMock();
		return request(app.getHttpServer())
			.post('/transactions')
			.set('Content-Type', 'application/json')
			.send({
				account: account.id,
				amount: 100,
				mcc: '5811',
				merchant: 'Restaurant',
			})
			.expect(200)
			.expect({ code: ResponseCodeEnum.APPROVED });
	});
});
