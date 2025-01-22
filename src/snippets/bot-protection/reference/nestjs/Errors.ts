import { ARCJET, type ArcjetNest, detectBot } from "@arcjet/nest";
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Req,
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

    for (const { reason } of decision.results) {
      if (reason.isError()) {
        if (reason.message.includes("requires user-agent header")) {
          // Requests without User-Agent headers can not be identified as any
          // particular bot and will be marked as an errored rule. Most
          // legitimate clients always send this header, so we recommend blocking
          // requests without it.
          // See https://docs.arcjet.com/bot-protection/concepts#user-agent-header
          console.warn("User-Agent header is missing");
          throw new HttpException("Bad request", HttpStatus.BAD_REQUEST);
        } else {
          // Fail open by logging the error and continuing
          console.warn("Arcjet error", reason.message);
          // You could also fail closed here for very sensitive routes
          //throw new HttpException("Service unavailable", HttpStatus.SERVICE_UNAVAILABLE);
        }
      }
    }

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);
      } else {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }
    }

    return this.pageService.message();
  }
}
