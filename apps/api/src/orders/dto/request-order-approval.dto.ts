import { IsOptional, IsString, IsUUID } from 'class-validator';

export class RequestOrderApprovalDto {
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  amountCents?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}
