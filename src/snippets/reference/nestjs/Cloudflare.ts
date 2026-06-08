import { ArcjetModule, cloudflare } from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env.local",
    }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        // Rules set here will apply to every request
      ],
      // Read the real client IP from Cloudflare's `CF-Connecting-IP` header when
      // the request arrives from a Cloudflare IP range
      proxies: [cloudflare()],
    }),
    // ... other modules
  ],
})
export class AppModule {}
