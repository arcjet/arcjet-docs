import {
  ARCJET,
  type ArcjetNest,
  ArcjetRuleResult,
  detectBot,
} from "@arcjet/nest";
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
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
export class PageAdvancedService {
  message(): { message: string } {
    return {
      message: "Hello world",
    };
  }
}

// This would normally go in your controller file e.g.
// src/page/page.controller.ts
@Controller("page")
// Sets up the Arcjet protection without using a guard so we can access the
// decision and use it in the controller.
export class PageAdvancedController {
  constructor(
    private readonly pageService: PageAdvancedService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) {}

  @Get()
  async index(@Req() req: Request) {
    const decision = await this.arcjet
      .withRule(
        detectBot({
          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
          // configured with a list of bots to allow from
          // https://arcjet.com/bot-list
          allow: [], // blocks all automated clients
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
    // Verification isn't always possible, so we recommend checking the results
    // separately.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.results.some(isSpoofed)) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.pageService.message();
  }
}
