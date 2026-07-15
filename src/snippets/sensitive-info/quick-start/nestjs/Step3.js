import { ArcjetGuard, ArcjetModule, sensitiveInfo } from "@arcjet/nest";
import { rampart } from "@arcjet/sensitive-info-rampart";
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
      key: process.env.ARCJET_KEY,
      rules: [
        sensitiveInfo({
          mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
          // Detect names and email addresses. See the reference for the full list.
          deny: ["EMAIL", "GIVEN_NAME", "SURNAME"],
          // Use the on-device Rampart NER model instead of the built-in engine.
          backend: rampart(),
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
