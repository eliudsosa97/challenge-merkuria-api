import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';

describe('Validación de CreateProductDto', () => {
  it('acepta datos válidos', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Phone',
      category: 'Electronics',
      price: 99.99,
      rating: 4.5,
      stock: 10,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rechaza price/rating/stock inválidos', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 12, // no es string
      category: '', // es string, pero sin validaciones adicionales
      price: -1, // inválido
      rating: 10, // inválido > 5
      stock: -3, // inválido
    } as any);
    const errors = await validate(dto);
    // Debe contener errores
    expect(errors.length).toBeGreaterThan(0);
  });
});
