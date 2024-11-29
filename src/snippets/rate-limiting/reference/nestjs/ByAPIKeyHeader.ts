import { ArcjetModule, fixedWindow } from "@arcjet/nest";
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
      characteristics: ['http.request.headers["x-api-key"]'],
      rules: [
        fixedWindow({
          mode: "LIVE",
          window: "1h",
          max: 60,
        }),
      ],
    }),
    // ... other modules
  ],
  //controllers: [AppController],
  //providers: [AppService],
})
export class AppModule {}
