import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { QueryProductDto } from './dto/query-product.dto';

// Mock mínimo y encadenable de QueryBuilder
class QueryBuilderMock<T = any> {
  calls: Record<string, any[]> = {};
  private many: T[] = [];
  private count = 0;
  private rawOne: any = { avg: '0' };
  private rawMany: any[] = [];

  andWhere = jest.fn().mockImplementation((...args: any[]) => {
    this.calls.andWhere = [...(this.calls.andWhere || []), args];
    return this;
  });
  orderBy = jest.fn().mockImplementation((...args: any[]) => {
    this.calls.orderBy = [...(this.calls.orderBy || []), args];
    return this;
  });
  select = jest.fn().mockImplementation((...args: any[]) => {
    this.calls.select = [...(this.calls.select || []), args];
    return this;
  });
  addSelect = jest.fn().mockImplementation((...args: any[]) => {
    this.calls.addSelect = [...(this.calls.addSelect || []), args];
    return this;
  });
  groupBy = jest.fn().mockImplementation((...args: any[]) => {
    this.calls.groupBy = [...(this.calls.groupBy || []), args];
    return this;
  });
  skip = jest.fn().mockImplementation((value: number) => {
    this.calls.skip = [value];
    return this;
  });
  take = jest.fn().mockImplementation((value: number) => {
    this.calls.take = [value];
    return this;
  });

  // Setters de datos para configurar resultados
  setManyAndCount(data: T[], total: number) {
    this.many = data;
    this.count = total;
  }
  setRawOne(row: any) {
    this.rawOne = row;
  }
  setRawMany(rows: any[]) {
    this.rawMany = rows;
  }

  getManyAndCount = jest
    .fn()
    .mockImplementation(async () => [this.many, this.count]);
  getCount = jest.fn().mockImplementation(async () => this.count);
  getRawOne = jest.fn().mockImplementation(async () => this.rawOne);
  getRawMany = jest.fn().mockImplementation(async () => this.rawMany);
}

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: jest.Mocked<Repository<Product>>;
  let qb: QueryBuilderMock<Product>;

  beforeEach(async () => {
    qb = new QueryBuilderMock<Product>();

    const repoMock: any = {
      create: jest.fn((dto) => ({ id: 'uuid', ...dto }) as any),
      save: jest.fn(async (p) => p as Product),
      createQueryBuilder: jest.fn().mockReturnValue(qb as any),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined as any),
      delete: jest.fn().mockResolvedValue(undefined as any),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repoMock },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repo = module.get(getRepositoryToken(Product));
  });

  it('creates a product', async () => {
    const dto = { name: 'A', category: 'Cat', price: 10 } as any;
    const result = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalled();
    expect(result).toMatchObject(dto);
  });

  it('findAll applies pagination, filters, and sorting', async () => {
    const query: QueryProductDto = {
      page: 2,
      limit: 5,
      category: 'Cat',
      minPrice: 5,
      maxPrice: 50,
      sortBy: 'price',
      sortOrder: 'DESC',
      search: 'abc',
    };
    const products: Product[] = [
      {
        id: '1',
        name: 'abc',
        category: 'Cat',
        price: 20 as any,
        rating: 4 as any,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    qb.setManyAndCount(products, 12);

    const res = await service.findAll(query);

    // Paginación
    expect(qb.skip).toHaveBeenCalledWith(5); // (page-1)*limit = 5
    expect(qb.take).toHaveBeenCalledWith(5);

    // Filtros y búsqueda
    expect(qb.andWhere).toHaveBeenCalledWith('product.category = :category', {
      category: 'Cat',
    });
    expect(qb.andWhere).toHaveBeenCalledWith(
      'product.price BETWEEN :minPrice AND :maxPrice',
      { minPrice: 5, maxPrice: 50 },
    );
    expect(qb.andWhere).toHaveBeenCalledWith('product.name ILIKE :search', {
      search: '%abc%',
    });

    // Ordenamiento
    expect(qb.orderBy).toHaveBeenCalledWith('product.price', 'DESC');

    expect(res).toEqual({ data: products, total: 12 });
  });

  it('findAll handles only minPrice or only maxPrice', async () => {
    qb.setManyAndCount([], 0);

    await service.findAll({ minPrice: 10 });
    expect(qb.andWhere).toHaveBeenCalledWith('product.price >= :minPrice', {
      minPrice: 10,
    });

    await service.findAll({ maxPrice: 99 });
    expect(qb.andWhere).toHaveBeenCalledWith('product.price <= :maxPrice', {
      maxPrice: 99,
    });
  });

  it('findOne returns entity when found', async () => {
    const product = { id: 'p1' } as Product;
    repo.findOne.mockResolvedValue(product);
    await expect(service.findOne('p1')).resolves.toBe(product);
  });

  it('findOne throws NotFound when missing', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update re-fetches and returns updated entity', async () => {
    const product = { id: 'p1' } as Product;
    repo.findOne.mockResolvedValue(product);
    const updated = { id: 'p1', name: 'X' } as Product;
    // findOne se llama dos veces: antes y después de la actualización
    repo.findOne.mockResolvedValueOnce(product).mockResolvedValueOnce(updated);

    const res = await service.update('p1', { name: 'X' } as any);
    expect(repo.update).toHaveBeenCalledWith('p1', { name: 'X' });
    expect(res).toBe(updated);
  });

  it('remove deletes after verifying existence', async () => {
    repo.findOne.mockResolvedValue({ id: 'p1' } as Product);
    await service.remove('p1');
    expect(repo.delete).toHaveBeenCalledWith('p1');
  });

  it('getCategories returns distinct category list', async () => {
    const qbLocal = qb as any;
    // getCategories construye un nuevo QueryBuilder; se fuerza el repositorio a devolver el mock
    (repo.createQueryBuilder as jest.Mock).mockReturnValueOnce(qbLocal);
    qb.setRawMany([{ category: 'A' }, { category: 'B' }]);

    const res = await service.getCategories();
    expect(res).toEqual(['A', 'B']);
    expect(qb.select).toHaveBeenCalledWith(
      'DISTINCT product.category',
      'category',
    );
  });

  it('getStatistics computes totals and percentages with filters', async () => {
    // getStatistics construye un nuevo QueryBuilder; se fuerza el repositorio a devolver el mock
    (repo.createQueryBuilder as jest.Mock).mockReturnValueOnce(qb as any);

    qb.setRawOne({ avg: '25.50' });
    qb.setRawMany([
      { category: 'A', count: '3' },
      { category: 'B', count: '1' },
    ]);
    // getCount debe retornar 4 (suma anterior)
    (qb as any).count = 4;

    const res = await service.getStatistics({
      category: 'A',
      minPrice: 10,
      maxPrice: 100,
      search: 'x',
    });

    // Filtros aplicados en el QueryBuilder
    expect(qb.andWhere).toHaveBeenCalledWith('product.category = :category', {
      category: 'A',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('product.price >= :minPrice', {
      minPrice: 10,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('product.price <= :maxPrice', {
      maxPrice: 100,
    });
    expect(qb.andWhere).toHaveBeenCalledWith('product.name ILIKE :search', {
      search: '%x%',
    });

    expect(res).toEqual({
      totalProducts: 4,
      averagePrice: 25.5,
      byCategory: [
        { category: 'A', count: 3, percentage: 75 },
        { category: 'B', count: 1, percentage: 25 },
      ],
    });
  });

  it('getStatistics handles empty dataset (avg NaN)', async () => {
    (repo.createQueryBuilder as jest.Mock).mockReturnValueOnce(qb as any);
    qb.setRawOne({ avg: null });
    (qb as any).count = 0;
    qb.setRawMany([]);

    const res = await service.getStatistics({});
    expect(res).toEqual({ totalProducts: 0, averagePrice: 0, byCategory: [] });
  });
});
