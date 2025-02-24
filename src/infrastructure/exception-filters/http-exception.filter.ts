import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const responseJson = this.buildResponseJson(exception);

		if (responseJson.status >= 400 && responseJson.status < 500) {
			Logger.warn({
				msg: 'HttpExceptionFilter.warn',
				err: exception,
				data: responseJson,
			});
		}

		if (responseJson.status >= 500) {
			Logger.error({
				msg: 'HttpExceptionFilter.error',
				err: exception,
				data: responseJson,
			});
		}

		response.status(responseJson.status).json(responseJson);
	}

	private buildResponseJson(exception: unknown) {
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const response = exception.getResponse();
			if (response instanceof Object) {
				return { ...response, status };
			}
			return { message: response, status };
		}

		if (exception instanceof PrismaClientValidationError) {
			const response = exception.message;
			const status = HttpStatus.BAD_REQUEST;
			return { message: response, status };
		}

		return {
			message: 'Internal server error',
			status: HttpStatus.INTERNAL_SERVER_ERROR,
		};
	}
}
