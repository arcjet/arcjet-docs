import { WithArcjetRules, sensitiveInfo } from "@arcjet/nest";
import { Body, Injectable, Post, Req } from "@nestjs/common";

// This would normally go in your controller file e.g.
// src/page/page.controller.ts
// Attaches the ArcjetGuard to the controller to protect it with the specified
// rules extended from the global rules defined in app.module.ts.
@WithArcjetRules([
  // This allows all sensitive entities other than email addresses
  sensitiveInfo({
    mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
    // allow: ["EMAIL"], Will block all sensitive information types other than email.
    deny: ["EMAIL"], // Will block email addresses
  }),
])
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  async index(@Req() req: Request, @Body() body: string) {
    return this.pageService.message(body);
  }
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
