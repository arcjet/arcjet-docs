import { ArcjetModule, sensitiveInfo } from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
//import { AppController } from './app.controller.js';
//import { AppService } from './app.service.js';

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
        // This allows all sensitive entities other than email addresses
        sensitiveInfo({
          mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
          // allow: ["EMAIL"], Will block all sensitive information types other than email.
          deny: ["EMAIL"], // Will block email addresses
        }),
      ],
    }),
    // ... other modules
  ],
  //controllers: [AppController],
  //providers: [AppService],
})
export class AppModule {}