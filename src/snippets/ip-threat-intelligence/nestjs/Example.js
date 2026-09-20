import { ArcjetGuard, ArcjetModule, filter } from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, NestFactory } from "@nestjs/core";

// Get your Arcjet key at <https://console.arcjet.com>.
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
      isGlobal: true,
      key: arcjetKey,
      rules: [
        filter({
          // Deny hosting (data center) IPs, VPNs, proxies, and Tor.
          // This does not deny privacy relays such as Apple Private Relay.
          deny: ["ip.src.hosting or ip.src.vpn or ip.src.proxy or ip.src.tor"],
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
