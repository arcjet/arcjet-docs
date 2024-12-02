import { WithArcjetRules, shield } from "@arcjet/nest";
import { Injectable, Get } from "@nestjs/common";

// This would normally go in your controller file e.g.
// src/page/page.controller.ts
// Attaches the ArcjetGuard to the controller to protect it with the specified
// rules extended from the global rules defined in app.module.ts.
@WithArcjetRules([
  shield({
    mode: "LIVE",
  }),
])
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  index() {
    return this.pageService.message();
  }
}

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
