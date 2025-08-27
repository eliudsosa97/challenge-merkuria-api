import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(
    queryDto: QueryProductDto,
  ): Promise<{ data: Product[]; total: number }> {
    const { page = 1, limit = 10, ...filters } = queryDto;
    const skip = (page - 1) * limit;
    const query = this.productRepository.createQueryBuilder('product');

    // Filtrar por categoría
    if (filters.category) {
      query.andWhere('product.category = :category', {
        category: filters.category,
      });
    }

    // Filtrar por rango de precio
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      query.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      });
    } else if (filters.minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    } else if (filters.maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    // Búsqueda por nombre
    if (filters.search) {
      query.andWhere('product.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    // Ordenamiento
    if (filters.sortBy) {
      const order = filters.sortOrder || 'ASC';
      query.orderBy(`product.${filters.sortBy}`, order);
    }

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.findOne(id);
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.productRepository.delete(id);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .getRawMany();

    return result.map((item) => item.category);
  }

  async getStatistics(queryDto: QueryProductDto): Promise<any> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (queryDto.category) {
      queryBuilder.andWhere('product.category = :category', {
        category: queryDto.category,
      });
    }
    if (queryDto.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: queryDto.minPrice,
      });
    }
    if (queryDto.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: queryDto.maxPrice,
      });
    }
    if (queryDto.search) {
      queryBuilder.andWhere('product.name ILIKE :search', {
        search: `%${queryDto.search}%`,
      });
    }

    const totalProducts = await queryBuilder.getCount();

    const averagePriceResult = await queryBuilder
      .select('AVG(product.price)', 'avg')
      .getRawOne();

    const categoryStats = await queryBuilder
      .select('product.category', 'category')
      .addSelect('COUNT(product.id)', 'count')
      .groupBy('product.category')
      .getRawMany();

    const averagePrice = parseFloat(averagePriceResult.avg) || 0;

    return {
      totalProducts,
      averagePrice,
      byCategory: categoryStats.map((item) => {
        const count = parseInt(item.count, 10) || 0;
        const percentage =
          totalProducts > 0 ? (count / totalProducts) * 100 : 0;
        return {
          category: item.category,
          count,
          percentage: parseFloat(percentage.toFixed(2)),
        };
      }),
    };
  }
}
