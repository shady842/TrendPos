import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateMenuItemDto {
  @IsUUID()
  companyId!: string;

  @IsString()
  name!: string;

  @IsInt()
  @Min(0)
  basePriceCents!: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
