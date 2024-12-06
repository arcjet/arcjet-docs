import { setRateLimitHeaders } from "@arcjet/decorate";
import { ARCJET, type ArcjetNest, fixedWindow } from "@arcjet/nest";
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Req,
  Res,
} from "@nestjs/common";
import type { Request } from "express";

// This would normally go in your service file e.g.
// src/page/page.service.ts
@Injectable()
export class PageService {
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
export class PageController {
  constructor(
    private readonly pageService: PageService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) {}

  @Get()
  // The passthrough option allows us to access the response object so we can
  // set the rate limit headers. See
  // https://docs.nestjs.com/controllers#library-specific-approach
  async index(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const decision = await this.arcjet
      .withRule(
        fixedWindow({
          mode: "LIVE",
          window: "1h",
          max: 60,
        }),
      )
      .protect(req);

    // Set the rate limit headers on the response object
    setRateLimitHeaders(res, decision);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new HttpException(
          "Too many requests",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      } else {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }
    }

    return this.pageService.message();
  }
}
