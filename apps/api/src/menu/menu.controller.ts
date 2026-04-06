import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menu: MenuService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getMenu(
    @CurrentUser() user: AuthUser,
    @Query('companyId') companyId: string,
  ) {
    return this.menu.getMenu(user.userId, companyId);
  }

  @Post('items')
  @UseGuards(AuthGuard('jwt'))
  createItem(@CurrentUser() user: AuthUser, @Body() dto: CreateMenuItemDto) {
    return this.menu.createItem(user.userId, dto);
  }
}
