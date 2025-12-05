import { ArcjetModule, slidingWindow } from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env.local",
      isGlobal: true,
    }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      // To illustrate, allow 3 requests per minute per IP address.
      rules: [slidingWindow({ interval: 60, max: 3, mode: "LIVE" })],
      // @ts-expect-error: TODO does not yet exist.
      // Assumes requests will have an `x-my-ip` header that you trust:
      trustedIpHeader: "x-my-ip",
    }),
    // ... other modules
  ],
})
export class AppModule {}
