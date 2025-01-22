import {
  ARCJET,
  ArcjetDecision,
  type ArcjetNest,
  ArcjetRuleResult,
  protectSignup,
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

// If the signup was coming from a proxy or Tor IP address this is suspicious,
// but we don't want to block them. Instead we will require manual verification
function isProxyOrTor(decision: ArcjetDecision): boolean {
  for (const result of decision.results) {
    if (
      result.reason.isBot() &&
      (decision.ip.isProxy() || decision.ip.isTor())
    ) {
      return true;
    }
  }
  return false;
}

// If the signup email address was from a free provider we want to double check
// their details.
function isFreeEmail(decision: ArcjetDecision): boolean {
  for (const result of decision.results) {
    if (result.reason.isEmail() && result.reason.emailTypes.includes("FREE")) {
      return true;
    }
  }
  return false;
}

function isSpoofed(result: ArcjetRuleResult) {
  return result.reason.isBot() && result.reason.isSpoofed();
}

@Controller("signup")
export class SignupController {
  private readonly logger = new Logger(SignupController.name);

  constructor(
    private readonly signupService: SignupService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) {}

  // Implement a form handler following
  // https://docs.nestjs.com/techniques/file-upload#no-files. Note this isn't
  // compatible with the NestJS Fastify adapter.
  @Post()
  @UseInterceptors(NoFilesInterceptor())
  async index(@Req() req: Request, @Body() body: SignupDto) {
    const decision = await this.arcjet
      .withRule(
        protectSignup({
          email: {
            mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
            // Block emails that are disposable, invalid, or have no MX records
            block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
          },
          bots: {
            mode: "LIVE",
            // configured with a list of bots to allow from
            // https://arcjet.com/bot-list
            allow: ["CURL"], // prevents bots from submitting the form, but allow curl for this example
          },
          // It would be unusual for a form to be submitted more than 5 times in 10
          // minutes from the same IP address
          rateLimit: {
            // uses a sliding window rate limit
            mode: "LIVE",
            interval: "2m", // counts requests over a 10 minute sliding window
            max: 5, // allows 5 submissions within the window
          },
        }),
      )
      .protect(req, { email: body.email });

    this.logger.log(`Arcjet: id = ${decision.id}`);
    this.logger.log(`Arcjet: decision = ${decision.conclusion}`);

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new HttpException("No bots allowed", HttpStatus.FORBIDDEN);
      } else if (decision.reason.isRateLimit()) {
        throw new HttpException(
          "Too many requests",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      } else if (decision.reason.isEmail()) {
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

    // Arcjet Pro plan verifies the authenticity of common bots using IP data.
    // Verification isn't always possible, so we recommend checking the decision
    // separately.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    if (decision.results.some(isSpoofed)) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    // At this point the signup is allowed, but we may want to take additional
    // verification steps

    const requireAdditionalVerification =
      isProxyOrTor(decision) || isFreeEmail(decision);

    // User creation code goes here...

    return this.signupService.signup(body.email);
  }
}
