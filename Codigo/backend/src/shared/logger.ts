import pino, { type LoggerOptions } from 'pino';

import { env } from '../config/env.js';

const baseOptions: LoggerOptions = {
	level: env.NODE_ENV === 'development' ? 'debug' : 'info',
};

export const logger =
	env.NODE_ENV === 'development'
		? pino({
				...baseOptions,
				transport: {
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'SYS:standard',
						ignore: 'pid,hostname',
					},
				},
			})
		: pino(baseOptions);
