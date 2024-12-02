import { ARCJET, type ArcjetNest, sensitiveInfo } from "@arcjet/nest";
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
// This function is called by the`sensitiveInfo` rule to perform custom
// detection on strings.
function detectDash(tokens: string[]): Array<"CONTAINS_DASH" | undefined> {
  return tokens.map((token) => {
    if (token.includes("-")) {
      return "CONTAINS_DASH";
    }
  });
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
          deny: ["EMAIL", "CONTAINS_DASH"], // Will block email addresses and strings containing a dash
          detect: detectDash,
          contextWindowSize: 2,
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