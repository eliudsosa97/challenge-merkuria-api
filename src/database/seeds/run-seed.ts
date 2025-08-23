import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ProductSeedService } from './product-seed.service';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const productSeedService = app.get(ProductSeedService);

  try {
    await productSeedService.seedProducts();
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

runSeed();
