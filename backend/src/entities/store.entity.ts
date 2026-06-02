import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Branch } from './branch.entity';
import { License } from './license.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ntn: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  strn: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => User, (user) => user.store)
  users: User[];

  @OneToMany(() => Branch, (branch) => branch.store)
  branches: Branch[];

  @OneToMany(() => License, (license) => license.store)
  licenses: License[];
}
