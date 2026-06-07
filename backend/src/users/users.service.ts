import { Injectable, OnApplicationBootstrap, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import type { UserRole } from 'shared';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    // Check if there's any admin in the database
    const adminExists = await this.usersRepository.findOne({ where: { role: 'Admin' } });

    if (!adminExists) {
      this.logger.log('No Admin user found. Generating initial admin account...');
      
      // Admin static password
      let password = 'admin@access.com';

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create Admin
      const admin = new User();
      admin.username = 'mymn_saab';
      admin.email = 'admin@admin.com';
      admin.passwordHash = passwordHash;
      admin.role = 'Admin';
      admin.isPasswordChangeRequired = true;
      admin.isActive = true;

      await this.usersRepository.save(admin);

      // Print to console header format as requested
      console.log('\n==================================================');
      console.log('                 MYMN SAAB                        ');
      console.log('              SYSTEM ADMINISTRATOR                ');
      console.log('==================================================');
      console.log(`Admin Email:      admin@admin.com`);
      console.log(`Initial Password: ${password}`);
      console.log('FIRST LOGIN PASSWORD CHANGE IS MANDATORY');
      console.log('==================================================\n');

      // Write password to a setup.log file in root for ease of access during setup
      const rootPath = path.resolve(__dirname, '../../../../');
      const logContent = `==================================================\n` +
                         `                 MYMN SAAB                        \n` +
                         `              SYSTEM ADMINISTRATOR                \n` +
                         `==================================================\n` +
                         `Admin Email:      admin@admin.com\n` +
                         `Initial Password: ${password}\n` +
                         `Generated At:     ${new Date().toISOString()}\n` +
                         `First login password change is mandatory.\n` +
                         `==================================================\n`;
      
      fs.writeFileSync(path.join(rootPath, 'setup.log'), logContent);
      this.logger.log(`Setup credentials saved to ${path.join(rootPath, 'setup.log')}`);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByStoreId(storeId: string): Promise<User[]> {
    return this.usersRepository.find({ where: { storeId, isActive: true } });
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    storeId?: string;
    branchId?: string;
  }): Promise<Omit<User, 'passwordHash'>> {
    // Check for duplicate username or email
    const existing = await this.usersRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });
    if (existing) {
      throw new ConflictException('Username or email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = new User();
    user.username = data.username;
    user.email = data.email;
    user.passwordHash = passwordHash;
    user.role = data.role;
    user.storeId = data.storeId ?? '';
    user.branchId = data.branchId ?? '';
    user.isPasswordChangeRequired = true; // Force password change on first login
    user.isActive = true;

    const saved = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _ph, ...safeUser } = saved;
    return safeUser;
  }

  async deactivateUser(id: string): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = false;
    await this.usersRepository.save(user);
    return { success: true };
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
