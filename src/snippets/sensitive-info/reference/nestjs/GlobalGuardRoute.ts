import { ArcjetGuard } from "@arcjet/nest";
import {
  Body,
  Controller,
  Injectable,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

// This would normally go in your controller file e.g.
// src/page/page.controller.ts
@Controller("page")
// Uses the ArcjetGuard to protect the controller with the default rules defined
// in app.module.ts. Using a guard makes it easy to apply Arcjet rules, but you
// don't get access to the decision.
@UseGuards(ArcjetGuard)
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
