import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';

// Entities
import { User } from './entities/user.entity';
import { Store } from './entities/store.entity';
import { Branch } from './entities/branch.entity';
import { License } from './entities/license.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE') || 'sqlite';
        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST') || 'localhost',
            port: configService.get<number>('DB_PORT') || 5432,
            username: configService.get<string>('DB_USERNAME') || 'postgres',
            password: configService.get<string>('DB_PASSWORD') || 'postgres',
            database: configService.get<string>('DB_DATABASE') || 'medicore_erp',
            entities: [User, Store, Branch, License, AuditLog],
            synchronize: configService.get<boolean>('DB_SYNCHRONIZE') !== false,
          };
        } else {
          return {
            type: 'sqlite',
            database: 'medicore_erp.sqlite',
            entities: [User, Store, Branch, License, AuditLog],
            synchronize: true,
          };
        }
      },
    }),
    AuthModule,
    UsersModule,
    StoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
