import {
  ArcjetGuard,
  ArcjetModule,
  detectBot,
  fixedWindow,
  shield,
} from "@arcjet/nest";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, NestFactory } from "@nestjs/core";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        // Create a bot detection rule
        detectBot({
          mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
          // Block all bots except the following
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
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
