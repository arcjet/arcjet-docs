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

// This would normally go in your service file, such as:
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

// Rampart scans all of the text, so scanning time grows with its length. Deny
// long input so one large request can't tie up the server. Raise the limit if
// your latency budget allows.
const MAX_INPUT_CHARS = 10_000;

// This would normally go in your controller file, such as:
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
    if (body.length > MAX_INPUT_CHARS) {
      throw new HttpException("Message too long", HttpStatus.PAYLOAD_TOO_LARGE);
    }

    const decision = await this.arcjet
      .withRule(
        sensitiveInfo({
          mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
          // Rampart detects names and addresses as well as email addresses
          // and government identifiers. See the reference for the full list.
          deny: ["EMAIL", "GIVEN_NAME", "SURNAME", "STREET_NAME", "SSN"],
          // Run detection on-device with the Rampart NER model.
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
