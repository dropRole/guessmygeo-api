import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ActionsModule } from './actions/actions.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const reflector: Reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  const specs: any = new DocumentBuilder();
  specs.addBearerAuth();
  specs.setTitle('GuessMYGeo API');
  specs.setDescription(
    'API for guessing geolocation regarding the image taken at the subject geolocation',
  );
  specs.setVersion('1.0');
  specs.setContact({
    name: 'Dušan Radosavljević',
    email: 'dusan.radosavljevic82@gmail.com',
  });
  specs.build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, specs, {
    include: [ActionsModule],
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}#${methodKey}`,
  });

  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'GuessMYGeo API',
  });

  await app.listen(process.env.PORT);
}
bootstrap();
