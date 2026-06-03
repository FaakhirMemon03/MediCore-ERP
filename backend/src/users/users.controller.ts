import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/users/:storeId
   * Admin: list all users belonging to a specific store
   */
  @Get('users/store/:storeId')
  @Roles('Admin')
  async getUsersByStore(@Param('storeId') storeId: string) {
    return this.usersService.findByStoreId(storeId);
  }

  /**
   * POST /api/users
   * Admin: create a new store user (Owner, Manager, Cashier, Accountant)
   */
  @Post('users')
  @Roles('Admin')
  async createUser(@Body() body: any) {
    const { username, email, password, role, storeId, branchId } = body;
    return this.usersService.createUser({ username, email, password, role, storeId, branchId });
  }

  /**
   * PATCH /api/users/:id/deactivate
   * Admin: deactivate (soft-delete) a user
   */
  @Patch('users/:id/deactivate')
  @Roles('Admin')
  async deactivateUser(@Param('id') id: string) {
    return this.usersService.deactivateUser(id);
  }
}
