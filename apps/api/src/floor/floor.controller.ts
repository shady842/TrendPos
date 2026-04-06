import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { FloorService } from './floor.service';

@Controller('branches')
export class FloorController {
  constructor(private readonly floor: FloorService) {}

  @Get(':branchId/floor/tables')
  @UseGuards(AuthGuard('jwt'))
  listTables(
    @CurrentUser() user: AuthUser,
    @Param('branchId') branchId: string,
  ) {
    return this.floor.listTables(user.userId, branchId);
  }

  @Post(':branchId/floor/tables')
  @UseGuards(AuthGuard('jwt'))
  createTable(
    @CurrentUser() user: AuthUser,
    @Param('branchId') branchId: string,
    @Body() body: { label: string; seats?: number; posX?: number; posY?: number },
  ) {
    return this.floor.createTable(user.userId, branchId, body);
  }
}
