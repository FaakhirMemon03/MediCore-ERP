import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';
import { UserRole } from '../../../shared/src/types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50, default: 'Cashier' })
  role: UserRole;

  @Column({ type: 'uuid', nullable: true })
  storeId: string;

  @Column({ type: 'uuid', nullable: true })
  branchId: string;

  @Column({ type: 'boolean', default: false })
  isPasswordChangeRequired: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Store, (store) => store.users, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'storeId' })
  store: Store;
}
