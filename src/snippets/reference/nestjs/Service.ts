import { ArcjetModule } from "@arcjet/nest";
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
      proxies: [
        // @ts-expect-error: TODO does not yet exist.
        // Assumes `cloudflare` are the Cloudflare IP ranges from
        // <https://docs.arcjet.com/concepts/client-ip#ip-ranges>.
        Object.fromEntries(cloudflare.map((d) => [d, "cf-connecting-ip"])),
      ],
      rules: [
        // Rules set here will apply to every request
      ],
    }),
    // ... other modules
  ],
})
export class AppModule {}
