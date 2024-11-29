import { ArcjetModule } from "@arcjet/nest";
import { type LoggerService, Injectable, Logger } from "@nestjs/common";

// Sets up the built-in Arcjet logger to use the NestJS logger. This could go in
// a separate file e.g. src/arcjet-logger.ts See
// https://github.com/arcjet/example-nestjs/blob/main/src/arcjet-logger.ts for
// an example.
@Injectable()
export class ArcjetLogger implements LoggerService {
  private readonly logger = new Logger(ArcjetLogger.name);

  log(message: any, ...optionalParams: any[]) {
    this.logger.log(message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  info(message: any, ...optionalParams: any[]) {
    this.logger.log(message, ...optionalParams);
  }
}

// Set up the root Arcjet client with the custom logger. See
// https://github.com/arcjet/example-nestjs/blob/main/src/app.module.ts for an
// example.
ArcjetModule.forRoot({
  isGlobal: true,
  key: process.env.ARCJET_KEY!,
  rules: [],
  // Configures Arcjet to use a Nest compatible logger
  log: new ArcjetLogger(),
});
