import { ARCJET, type ArcjetNest, sensitiveInfo } from "@arcjet/nest";
import {
  defaultRecognizers,
  type DetectedSpan,
  rampart,
} from "@arcjet/sensitive-info-rampart";
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

// This would normally go in your controller file, such as:
// src/page/page.controller.ts
// A recognizer receives the full text and returns the spans it matched. This
// one reports IBANs as bank account numbers.
function detectIban(value: string): DetectedSpan[] {
  const spans: DetectedSpan[] = [];
  for (const match of value.matchAll(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g)) {
    spans.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "BANK_ACCOUNT",
    });
  }
  return spans;
}

@Controller("page")
// Sets up the Arcjet protection without using a guard so we can access the
// decision and use it in the controller.
export class PageController {
  // Make use of the NestJS logger: https://docs.nestjs.com/techniques/logger
  // See
  // https://github.com/arcjet/example-nestjs/blob/ec742e58c8da52d0a399327182c79e3f4edc8f3b/src/app.module.ts#L29
  // and https://github.com/arcjet/example-nestjs/blob/main/src/arcjet-logger.ts
  // for an example of how to connect Arcjet to the NestJS logger
  private readonly logger = new Logger(PageController.name);

  constructor(
    private readonly pageService: PageService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) {}

  @Post()
  async index(@Req() req: Request, @Body() body: string) {
    const decision = await this.arcjet
      .withRule(
        // This allows all sensitive entities other than email addresses
        sensitiveInfo({
          mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
          // allow: ["EMAIL"], Will block all sensitive information types other than email.
          deny: ["EMAIL", "BANK_ACCOUNT"], // Will block email addresses and IBANs
          backend: rampart({
            // Keep the default recognizers and add your own.
            recognizers: [...defaultRecognizers, detectIban],
          }),
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
