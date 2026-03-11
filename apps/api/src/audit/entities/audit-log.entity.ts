import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditEvent } from '@/core/ports';

@Entity('audit_logs')
@Index(['reportId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Intentionally stored as a plain UUID without a TypeORM relation.
  // This keeps the audit module independent of the reports module,
  // allowing both to be extracted as separate microservices.
  @Column({ name: 'report_id', type: 'uuid' })
  reportId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  eventType!: AuditEvent;

  @Column({ type: 'varchar', length: 100 })
  provider!: string;

  @Column({ type: 'varchar', length: 150 })
  model!: string;

  @Column({ name: 'prompt_sent', type: 'text' })
  promptSent!: string;

  @Column({ name: 'raw_response', type: 'text', nullable: true })
  rawResponse!: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'latency_ms', type: 'int', nullable: true })
  latencyMs!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
