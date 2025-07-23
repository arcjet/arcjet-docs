import { ArcjetModule } from "@arcjet/nest";
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
      proxies: [
        "100.100.100.100", // A single IP
        "100.100.100.0/24", // A CIDR for the range
      ],
    }),
    // ... other modules
  ],
})
export class AppModule {}
