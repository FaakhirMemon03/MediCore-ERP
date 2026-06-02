import { Controller, Get, Post, Body, Param, UseGuards, Put } from '@nestjs/common';
import { StoresService } from './stores.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // Admin panel dashboard: Create Store
  @Post('stores')
  @Roles('Admin')
  async createStore(@Body() body: any) {
    const { name, ntn, strn, phone, address } = body;
    return this.storesService.createStore(name, ntn, strn, phone, address);
  }

  // Admin panel dashboard: Get all stores
  @Get('stores')
  @Roles('Admin')
  async findAll() {
    return this.storesService.findAll();
  }

  // Admin panel dashboard: Get store detail
  @Get('stores/:id')
  @Roles('Admin')
  async findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  // Admin panel dashboard: Suspend store
  @Post('stores/:id/suspend')
  @Roles('Admin')
  async suspendStore(@Param('id') id: string) {
    return this.storesService.setStoreLicenseStatus(id, 'Suspended');
  }

  // Admin panel dashboard: Activate store
  @Post('stores/:id/activate')
  @Roles('Admin')
  async activateStore(@Param('id') id: string) {
    return this.storesService.setStoreLicenseStatus(id, 'Active');
  }

  // Admin panel dashboard: Renew/Extend subscription
  @Put('stores/:id/renew')
  @Roles('Admin')
  async renewStore(@Param('id') id: string, @Body() body: any) {
    const { days, plan } = body;
    return this.storesService.extendLicense(id, days || 30, plan || 'Basic');
  }

  // Desktop startup: verify license status. Accessible by any authenticated role
  @Get('license/:storeId')
  async checkLicense(@Param('storeId') storeId: string) {
    const store = await this.storesService.findOne(storeId);
    if (!store.licenses || store.licenses.length === 0) {
      return {
        status: 'Unlicensed',
        isValid: false,
        message: 'This store does not have a license.',
      };
    }
    
    const license = store.licenses[0];
    const expiryTime = new Date(license.expiryDate).getTime();
    const now = Date.now();

    let isValid = license.status === 'Active' && expiryTime > now;
    
    return {
      storeId: license.storeId,
      plan: license.plan,
      expiryDate: license.expiryDate,
      status: license.status,
      isValid,
      serverTime: new Date().toISOString(),
    };
  }
}
