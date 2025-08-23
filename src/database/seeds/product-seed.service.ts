import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Injectable()
export class ProductSeedService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async seedProducts(): Promise<void> {
    const existingProducts = await this.productRepository.count();

    if (existingProducts > 0) {
      console.log('Products already exist, skipping seed...');
      return;
    }

    const products = [
      // Alimento
      {
        name: 'Croquetas para Cachorro 10kg',
        category: 'Alimento',
        price: 899.99,
        rating: 4.8,
        stock: 30,
      },
      {
        name: 'Alimento Húmedo para Gato (Lata)',
        category: 'Alimento',
        price: 35.5,
        rating: 4.6,
        stock: 150,
      },
      {
        name: 'Premios de Pollo Deshidratado',
        category: 'Alimento',
        price: 150.0,
        rating: 4.9,
        stock: 80,
      },
      {
        name: 'Croquetas para Perro Adulto 20kg',
        category: 'Alimento',
        price: 1499.0,
        rating: 4.7,
        stock: 25,
      },

      // Juguetes
      {
        name: 'Pelota de Goma Resistente',
        category: 'Juguetes',
        price: 120.0,
        rating: 4.5,
        stock: 100,
      },
      {
        name: 'Ratón de Cuerda para Gato',
        category: 'Juguetes',
        price: 89.99,
        rating: 4.3,
        stock: 120,
      },
      {
        name: 'Hueso de Nylon Masticable',
        category: 'Juguetes',
        price: 250.0,
        rating: 4.7,
        stock: 70,
      },
      {
        name: 'Caña con Plumas para Gato',
        category: 'Juguetes',
        price: 110.0,
        rating: 4.6,
        stock: 90,
      },

      // Higiene
      {
        name: 'Shampoo Antipulgas para Perro',
        category: 'Higiene',
        price: 180.0,
        rating: 4.6,
        stock: 60,
      },
      {
        name: 'Arena para Gato Aglutinante 10L',
        category: 'Higiene',
        price: 220.0,
        rating: 4.8,
        stock: 50,
      },
      {
        name: 'Cepillo Dental para Mascota',
        category: 'Higiene',
        price: 95.0,
        rating: 4.2,
        stock: 110,
      },
      {
        name: 'Toallitas Húmedas Limpiadoras',
        category: 'Higiene',
        price: 130.0,
        rating: 4.4,
        stock: 85,
      },

      // Accesorios
      {
        name: 'Collar de Cuero con Placa',
        category: 'Accesorios',
        price: 350.0,
        rating: 4.7,
        stock: 40,
      },
      {
        name: 'Cama Acojinada Mediana',
        category: 'Accesorios',
        price: 750.0,
        rating: 4.9,
        stock: 20,
      },
      {
        name: 'Plato de Acero Inoxidable',
        category: 'Accesorios',
        price: 150.0,
        rating: 4.5,
        stock: 130,
      },
      {
        name: 'Transportadora Rígida Pequeña',
        category: 'Accesorios',
        price: 950.0,
        rating: 4.6,
        stock: 15,
      },

      // Salud
      {
        name: 'Suplemento de Omega 3 para Piel',
        category: 'Salud',
        price: 450.0,
        rating: 4.8,
        stock: 35,
      },
      {
        name: 'Gotas Relajantes Naturales',
        category: 'Salud',
        price: 320.0,
        rating: 4.4,
        stock: 45,
      },
      {
        name: 'Protector de Patas (Bálsamo)',
        category: 'Salud',
        price: 190.0,
        rating: 4.7,
        stock: 55,
      },
    ];

    console.log('Seeding products...');

    for (const productData of products) {
      const product = this.productRepository.create(productData);
      await this.productRepository.save(product);
    }

    console.log(`✅ Successfully seeded ${products.length} products!`);
  }
}
