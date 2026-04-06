import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateApprovalDto {
  @IsUUID()
  companyId!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsString()
  type!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
