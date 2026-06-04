import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';

@Entity('licenses')
export class License {
  @PrimaryColumn('uuid')
  storeId: string;

  @Column({ type: 'varchar', length: 50, default: 'Basic' })
  plan: 'Basic' | 'Professional' | 'Enterprise';

  @Column({ type: 'datetime' })
  expiryDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'Active' })
  status: 'Active' | 'Expired' | 'Suspended';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  lastCheckedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Store, (store) => store.licenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;
}
