import {
  ARCJET,
  type ArcjetNest,
  detectBot,
  validateEmail,
} from "@arcjet/nest";
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
  UseInterceptors,
} from "@nestjs/common";
import { NoFilesInterceptor } from "@nestjs/platform-express";
import { IsNotEmpty } from "class-validator";
import type { Request } from "express";

// Validation class as described at
// https://docs.nestjs.com/techniques/validation. We're not using the IsEmail
// decorator here because Arcjet handles this for you.
export class SignupDto {
  @IsNotEmpty()
  // @ts-ignore: This is a DTO class so ignore that it's not definitely assigned
  email: string;
}

// This would normally go in your service file e.g.
// src/signup/signup.service.ts
@Injectable()
export class SignupService {
  private readonly logger = new Logger(SignupService.name);

  signup(email: string): { message: string } {
    this.logger.log(`Form submission: ${email}`);

    return {
      message: "Hello world",
    };
  }
}

// This would normally go in your controller file e.g.
// src/signup/signup.controller.ts
@Controller("signup")
export class SignupController {
  private readonly logger = new Logger(SignupController.name);

  constructor(
    private readonly signupService: SignupService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) { }

  // Implement a form handler following
  // https://docs.nestjs.com/techniques/file-upload#no-files. Note this isn't
  // compatible with the NestJS Fastify adapter.
  @Post()
  @UseInterceptors(NoFilesInterceptor())
  async index(@Req() req: Request, @Body() body: SignupDto) {
    const decision = await this.arcjet
      .withRule(
        detectBot({
          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
          // configured with a list of bots to allow from
          // https://arcjet.com/bot-list
          allow: [], // blocks all automated clients
        }),
      )
      .withRule(
        validateEmail({
          mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
          // block disposable, invalid, and email addresses with no MX records
          allow: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
        }),
      )
      .protect(req, { email: body.email });

    this.logger.log(`Arcjet: id = ${decision.id}`);
    this.logger.log(`Arcjet: decision = ${decision.conclusion}`);

    for (const result of decision.results) {
      this.logger.log("Rule Result", result);

      if (result.reason.isBot()) {
        this.logger.log("Bot protection rule", result);
      }

      if (result.reason.isEmail()) {
        this.logger.log("Email validation rule", result);
      }
    }

    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        this.logger.log(`Arcjet: email error = ${decision.reason.emailTypes}`);

        let message: string;

        // These are specific errors to help the user, but will also reveal the
        // validation to a spammer.
        if (decision.reason.emailTypes.includes("INVALID")) {
          message = "email address format is invalid. Is there a typo?";
        } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
          message = "we do not allow disposable email addresses.";
        } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
          message =
            "your email domain does not have an MX record. Is there a typo?";
        } else {
          // This is a catch all, but the above should be exhaustive based on the
          // configured rules.
          message = "invalid email.";
        }

        throw new HttpException(`Error: ${message}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }
    }

    return this.signupService.signup(body.email);
  }
}
