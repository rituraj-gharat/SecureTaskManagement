import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    const port = process.env.PORT || 3333;
    await app.listen(port);
    
    console.log(`✅ NestJS API server is running on: http://localhost:${port}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   - POST /auth/register`);
    console.log(`   - POST /auth/login`);
    console.log(`   - GET /tasks (requires auth)`);
    console.log(`   - POST /tasks (requires auth)`);
    console.log(`   - GET /team/members (requires auth)`);
    console.log(`   - POST /team/members/invite (requires auth)`);
  } catch (error) {
    console.error('❌ Failed to start API server:', error);
    process.exit(1);
  }
}
bootstrap();