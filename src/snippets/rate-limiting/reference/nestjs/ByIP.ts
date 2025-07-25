import { ArcjetModule, fixedWindow } from "@arcjet/nest";
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
        fixedWindow({
          mode: "LIVE",
          // Tracked by IP address by default, but this can be customized
          // See https://docs.arcjet.com/fingerprints
          //characteristics: ["ip.src"],
          window: "1h",
          max: 60,
        }),
      ],
    }),
    // ... other modules
  ],
})
export class AppModule {}
