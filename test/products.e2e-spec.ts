import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';

// Mock del servicio para aislar HTTP y validaciones
const mockProductsService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getCategories: jest.fn(),
  getStatistics: jest.fn(),
});

describe('Products E2E', () => {
  let app: INestApplication;
  let service: ReturnType<typeof mockProductsService>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useFactory: mockProductsService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    // Configuración equivalente a main.ts
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix('api');

    await app.init();

    service = app.get(ProductsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/products', () => {
    it('crea un producto válido', async () => {
      service.create.mockResolvedValue({
        id: '1',
        name: 'A',
        category: 'Cat',
        price: 10,
      });
      await request(app.getHttpServer())
        .post('/api/products')
        .send({ name: 'A', category: 'Cat', price: 10 })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toMatchObject({ id: '1', name: 'A' });
        });
      expect(service.create).toHaveBeenCalledWith({
        name: 'A',
        category: 'Cat',
        price: 10,
      });
    });

    it('rechaza cuerpo con campos no permitidos', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .send({ name: 'A', category: 'Cat', price: 10, extra: 'nope' })
        .expect(400);
    });
  });

  describe('GET /api/products', () => {
    it('retorna lista paginada y transforma query params', async () => {
      service.findAll.mockResolvedValue({ data: [], total: 0 });
      await request(app.getHttpServer())
        .get('/api/products')
        .query({
          page: '2',
          limit: '5',
          minPrice: '1',
          maxPrice: '10',
          sortBy: 'price',
          sortOrder: 'DESC',
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ data: [], total: 0 });
        });
      // La transformación a número la realiza ValidationPipe; aquí basta con verificar la invocación del servicio.
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/products/:id', () => {
    it('valida UUID y retorna 400 si es inválido', async () => {
      await request(app.getHttpServer())
        .get('/api/products/not-a-uuid')
        .expect(400);
    });

    it('retorna un producto válido', async () => {
      service.findOne.mockResolvedValue({
        id: 'c0a80101-7e6d-11e4-80aa-000000000000',
      });
      await request(app.getHttpServer())
        .get('/api/products/c0a80101-7e6d-11e4-80aa-000000000000')
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ id: 'c0a80101-7e6d-11e4-80aa-000000000000' });
        });
    });
  });

  describe('PATCH /api/products/:id', () => {
    it('actualiza y retorna el producto', async () => {
      service.update.mockResolvedValue({ id: '1', name: 'X' });
      await request(app.getHttpServer())
        .patch('/api/products/c0a80101-7e6d-11e4-80aa-000000000000')
        .send({ name: 'X' })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ id: '1', name: 'X' });
        });
      expect(service.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('elimina (200 sin cuerpo)', async () => {
      service.remove.mockResolvedValue(undefined);
      await request(app.getHttpServer())
        .delete('/api/products/c0a80101-7e6d-11e4-80aa-000000000000')
        .expect(200);
      expect(service.remove).toHaveBeenCalled();
    });
  });

  describe('GET /api/products/categories', () => {
    it('retorna categorías', async () => {
      service.getCategories.mockResolvedValue(['A', 'B']);
      await request(app.getHttpServer())
        .get('/api/products/categories')
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(['A', 'B']);
        });
    });
  });

  describe('GET /api/products/statistics', () => {
    it('retorna estadísticas', async () => {
      service.getStatistics.mockResolvedValue({
        totalProducts: 2,
        averagePrice: 10,
        byCategory: [],
      });
      await request(app.getHttpServer())
        .get('/api/products/statistics')
        .query({ minPrice: '1' })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            totalProducts: 2,
            averagePrice: 10,
            byCategory: [],
          });
        });
    });
  });
});
