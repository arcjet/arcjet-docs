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
        // Applies to every request
        fixedWindow({
          mode: "LIVE",
          window: "1h",
          max: 60,
        }),
      ],
    }),
    // ... other modules
  ],
})
export class AppModule {}
