import { ArcjetGuard, ArcjetModule, sensitiveInfo } from "@arcjet/nest";
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
        // This allows all sensitive entities other than email addresses
        sensitiveInfo({
          mode: "LIVE", // Will block requests, use "DRY_RUN" to log only
          // allow: ["EMAIL"], Will block all sensitive information types other than email.
          deny: ["EMAIL"], // Will block email addresses
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
