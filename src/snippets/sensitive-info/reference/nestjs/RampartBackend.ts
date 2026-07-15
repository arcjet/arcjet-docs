import { ARCJET, type ArcjetNest, sensitiveInfo } from "@arcjet/nest";
import { rampart } from "@arcjet/sensitive-info-rampart";
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";

// This would normally go in your service file e.g.
// src/page/page.service.ts
@Injectable()
export class PageService {
  message(content: string): { message: string; submittedContent: string } {
    return {
      message: "Hello world",
      submittedContent: content,
    };
  }
}

// This would normally go in your controller file e.g.
// src/page/page.controller.ts
@Controller("page")
// Sets up the Arcjet protection without using a guard so we can access the
// decision and use it in the controller.
export class PageController {
  // Make use of the NestJS logger: https://docs.nestjs.com/techniques/logger
  private readonly logger = new Logger(PageController.name);

  constructor(
    private readonly pageService: PageService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) {}

  @Post()
  async index(@Req() req: Request, @Body() body: string) {
    const decision = await this.arcjet
      .withRule(
        sensitiveInfo({
          mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
          // The Rampart model detects names, addresses, and
          // government/financial identifiers in addition to the built-in types.
          deny: ["EMAIL", "GIVEN_NAME", "SURNAME", "STREET_NAME", "SSN"],
          // Run detection on-device with the Rampart NER model instead of the
          // default WebAssembly engine.
          backend: rampart(),
        }),
      )
      .protect(req);

    this.logger.log(`Arcjet: id = ${decision.id}`);
    this.logger.log(`Arcjet: decision = ${decision.conclusion}`);

    if (decision.isDenied()) {
      if (decision.reason.isSensitiveInfo()) {
        throw new HttpException(
          "Unexpected sensitive info detected",
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }
    }

    return this.pageService.message(body);
  }
}
