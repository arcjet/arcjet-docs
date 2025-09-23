import { ArcjetGuard, ArcjetModule, filter } from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, NestFactory } from "@nestjs/core";

// Get your Arcjet key at <https://app.arcjet.com>.
// Set it as an environment variable instead of hard coding it.
const arcjetKey = process.env.ARCJET_KEY;

if (!arcjetKey) {
  throw new Error("Cannot find `ARCJET_KEY` environment variable");
}

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArcjetModule.forRoot({
      characteristics: ['http.request.headers["user-agent"]', "ip.src"],
      isGlobal: true,
      key: arcjetKey,
      rules: [
        filter({
          // Use `deny` to deny requests that match expressions and allow others.
          // Use `allow` to allow requests that match expressions and deny others.
          deny: [
            // Match VPN traffic, Tor traffic, basic Curl requests, or requests
            // without user agent.
            'ip.src.vpn or ip.src.tor or lower(http.request.headers["user-agent"]) matches "curl" or len(http.request.headers["user-agent"]) eq 0',
          ],
          // Block requests with `LIVE`, use `DRY_RUN` to log only.
          mode: "LIVE",
        }),
      ],
    }),
  ],
  providers: [{ useClass: ArcjetGuard, provide: APP_GUARD }],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
