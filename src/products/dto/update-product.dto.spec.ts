import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateProductDto } from './update-product.dto';

describe('Validación de UpdateProductDto', () => {
  it('acepta datos parciales', async () => {
    const dto = plainToInstance(UpdateProductDto, {
      price: 10,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rechaza price negativo', async () => {
    const dto = plainToInstance(UpdateProductDto, { price: -5 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
