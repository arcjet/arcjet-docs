import {
  ARCJET,
  type ArcjetNest,
  ArcjetRuleResult,
  sensitiveInfo,
} from "@arcjet/nest";
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";

function isSpoofed(result: ArcjetRuleResult) {
  return (
    // You probably don't want DRY_RUN rules resulting in a denial
    // since they are generally used for evaluation purposes but you
    // could log here.
    result.state !== "DRY_RUN" &&
    result.reason.isBot() &&
    result.reason.isSpoofed()
  );
}

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
          deny: ["EMAIL"], // Will block email addresses
        }),
      )
      .protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);
      } else {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }
    }

    // Arcjet Pro plan verifies the authenticity of common bots using IP data.
    // Verification isn't always possible, so we recommend checking the decision
    // separately.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.results.some(isSpoofed)) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.pageService.message(body);
  }
}
