import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<ProductsService> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getCategories: jest.fn(),
      getStatistics: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get(ProductsService);
  });

  it('delegates create', async () => {
    service.create.mockResolvedValue({ id: '1' } as any);
    const res = await controller.create({
      name: 'n',
      category: 'c',
      price: 1,
    } as any);
    expect(service.create).toHaveBeenCalled();
    expect(res).toEqual({ id: '1' });
  });

  it('delegates findAll', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    const res = await controller.findAll({} as any);
    expect(service.findAll).toHaveBeenCalled();
    expect(res).toEqual({ data: [], total: 0 });
  });

  it('delegates getCategories', async () => {
    service.getCategories.mockResolvedValue(['A']);
    const res = await controller.getCategories();
    expect(service.getCategories).toHaveBeenCalled();
    expect(res).toEqual(['A']);
  });

  it('delegates getStatistics', async () => {
    service.getStatistics.mockResolvedValue({
      totalProducts: 0,
      averagePrice: 0,
      byCategory: [],
    });
    const res = await controller.getStatistics({} as any);
    expect(service.getStatistics).toHaveBeenCalled();
    expect(res).toEqual({ totalProducts: 0, averagePrice: 0, byCategory: [] });
  });

  it('delegates findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' } as any);
    const res = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(res).toEqual({ id: '1' });
  });

  it('delegates update', async () => {
    service.update.mockResolvedValue({ id: '1', name: 'x' } as any);
    const res = await controller.update('1', { name: 'x' } as any);
    expect(service.update).toHaveBeenCalledWith('1', { name: 'x' });
    expect(res).toEqual({ id: '1', name: 'x' });
  });

  it('delegates remove', async () => {
    service.remove.mockResolvedValue(undefined);
    const res = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
    expect(res).toBeUndefined();
  });
});
