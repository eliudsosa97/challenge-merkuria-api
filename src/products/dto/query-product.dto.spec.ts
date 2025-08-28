import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { QueryProductDto } from './query-product.dto';

describe('Validación de QueryProductDto', () => {
  it('convierte cadenas numéricas a número y valida mínimos', async () => {
    const dto = plainToInstance(QueryProductDto, {
      minPrice: '1',
      maxPrice: '10',
      page: '2',
      limit: '5',
      sortBy: 'price',
      sortOrder: 'DESC',
      search: 'abc',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rechaza paginación no válida', async () => {
    const dto = plainToInstance(QueryProductDto, { page: 0, limit: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
