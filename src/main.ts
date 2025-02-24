import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { patchNestjsSwagger, ZodValidationPipe } from '@anatine/zod-nestjs';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './infrastructure/exception-filters/http-exception.filter';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.use(helmet());

	app.enableCors();

	app.useBodyParser('json', { limit: '1mb' });
	app.useBodyParser('urlencoded', { extended: true, limit: '1mb' });

	app.useGlobalPipes(new ZodValidationPipe());
	app.useGlobalFilters(new HttpExceptionFilter());

	patchNestjsSwagger();

	const config = new DocumentBuilder()
		.setTitle('Transaction Authorizer API')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, document);

	await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
