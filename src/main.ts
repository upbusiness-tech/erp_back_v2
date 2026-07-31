import './crud.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('query parser', 'extended');
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
    ],
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
