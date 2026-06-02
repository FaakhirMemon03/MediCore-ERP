import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../entities/store.entity';
import { License } from '../entities/license.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(License)
    private licenseRepository: Repository<License>,
  ) {}

  async createStore(name: string, ntn: string, strn: string, phone: string, address: string) {
    const store = new Store();
    store.name = name;
    store.ntn = ntn;
    store.strn = strn;
    store.phone = phone;
    store.address = address;
    
    const savedStore = await this.storesRepository.save(store);

    // Auto-create a basic license for 30 days
    const license = new License();
    license.storeId = savedStore.id;
    license.plan = 'Basic';
    license.status = 'Active';
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    license.expiryDate = expiry;

    await this.licenseRepository.save(license);

    return {
      store: savedStore,
      license,
    };
  }

  async findAll() {
    return this.storesRepository.find({ relations: { licenses: true } });
  }

  async findOne(id: string) {
    const store = await this.storesRepository.findOne({ where: { id }, relations: { licenses: true } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async setStoreLicenseStatus(storeId: string, status: 'Active' | 'Expired' | 'Suspended') {
    const license = await this.licenseRepository.findOne({ where: { storeId } });
    if (!license) {
      throw new NotFoundException('License not found for this store');
    }
    license.status = status;
    license.lastCheckedAt = new Date();
    return this.licenseRepository.save(license);
  }

  async extendLicense(storeId: string, days: number, plan: 'Basic' | 'Professional' | 'Enterprise') {
    const license = await this.licenseRepository.findOne({ where: { storeId } });
    if (!license) {
      throw new NotFoundException('License not found for this store');
    }
    
    license.plan = plan;
    license.status = 'Active';
    
    const currentExpiry = new Date(license.expiryDate);
    // If it's already expired, extend from today, otherwise extend from current expiry date
    const baseDate = currentExpiry.getTime() < Date.now() ? new Date() : currentExpiry;
    baseDate.setDate(baseDate.getDate() + days);
    license.expiryDate = baseDate;
    license.lastCheckedAt = new Date();

    return this.licenseRepository.save(license);
  }
}
