import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderLineInputDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsInt()
  @Min(0)
  unitPriceCents!: number;

  @IsOptional()
  @IsString()
  menuItemId?: string;
}

export class CreateOrderDto {
  @IsUUID()
  branchId!: string;

  @IsOptional()
  @IsString()
  channel?: string;

  /** POS offline idempotency */
  @IsOptional()
  @IsString()
  clientOrderId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineInputDto)
  lines!: OrderLineInputDto[];
}
