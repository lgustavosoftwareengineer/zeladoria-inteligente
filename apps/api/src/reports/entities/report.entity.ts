import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Category, Priority } from '@/core/domain';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 500 })
  location!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: Category;

  @Column({ type: 'varchar', length: 50 })
  priority!: Priority;

  @Column({ name: 'technical_summary', type: 'text' })
  technicalSummary!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
