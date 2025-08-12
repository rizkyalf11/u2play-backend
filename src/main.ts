import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('U2PLAY API')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
    },'token')
    .addTag('gaming')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.APP_PORT!);
  console.log('run at', process.env.APP_PORT!);
  console.log(
    'documentation at -> http://localhost:' + process.env.APP_PORT! + '/api',
  );
}
bootstrap();
