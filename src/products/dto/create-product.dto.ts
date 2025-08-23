import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;
}
