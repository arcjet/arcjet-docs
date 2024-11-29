import { ArcjetGuard } from "@arcjet/nest";
import { Controller, Get, Injectable, UseGuards } from "@nestjs/common";

// This would normally go in your controller file e.g.
// src/page/page.controller.ts
@Controller("page")
// Uses the ArcjetGuard to protect the controller with the default rules defined
// in app.module.ts. Using a guard makes it easy to apply Arcjet rules, but you
// don't get access to the decision.
@UseGuards(ArcjetGuard)
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
