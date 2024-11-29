import { ArcjetModule, detectBot } from "@arcjet/nest";
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
        // Applies to every request
        detectBot({
          mode: "LIVE",
          // configured with a list of bots to allow from
          // https://arcjet.com/bot-list - all other detected bots will be blocked
          allow: [
            "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
            // Uncomment to allow these other common bot categories
            // See the full list at https://arcjet.com/bot-list
            //"CATEGORY:MONITOR", // Uptime monitoring services
            //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
          ],
        }),
      ],
    }),
    // ... other modules
  ],
  //controllers: [AppController],
  //providers: [AppService],
})
export class AppModule {}
