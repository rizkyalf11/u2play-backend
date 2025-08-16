import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // const config = new DocumentBuilder()
  //   .setTitle('U2PLAY API')
  //   .setDescription('The cats API description')
  //   .setVersion('1.0')
  //   .addBearerAuth(
  //     {
  //       type: 'apiKey',
  //       in: 'header',
  //       name: 'Authorization',
  //     },
  //     'token',
  //   )
  //   .addTag('gaming')
  //   .build();
  // const documentFactory = () => SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, documentFactory);
  // app.set('trust proxy', true);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useStaticAssets(path.join(__dirname, '..', 'public'));
  app.enableCors();
  await app.listen(process.env.APP_PORT!);
  // console.log('run at', process.env.APP_PORT!);
  // console.log(
  //   'documentation at -> http://localhost:' + process.env.APP_PORT! + '/api',
  // );
}
bootstrap();
