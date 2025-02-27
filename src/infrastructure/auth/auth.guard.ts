/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	CanActivate,
	ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export class AuthGuard implements CanActivate {
	private readonly apiKey: string;
	constructor() {
		this.apiKey = process.env.API_KEY || '';
	}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const requestApiKey = this.extractApiKeyFromHeader(request);

		if (requestApiKey && requestApiKey === this.apiKey) {
			return true;
		}

		throw new UnauthorizedException();
	}

	private extractApiKeyFromHeader(request: Request): string | undefined {
		const apiKey = request.headers['api_key'];
		if (Array.isArray(apiKey)) {
			return apiKey[0];
		}
		return apiKey;
	}
}
