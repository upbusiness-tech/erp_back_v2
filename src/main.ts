import './crud.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('query parser', 'extended');
  const localhostOrigins = [
    'http://localhost:4200',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
  ];

  const corsOriginsEnv = process.env.CORS_ORIGINS;
  const origins = corsOriginsEnv
    ? [...localhostOrigins, ...corsOriginsEnv.split(',').map((o) => o.trim())]
    : localhostOrigins;

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
