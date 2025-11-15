import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  timestamp!: string;

  @Column()
  userId!: string;

  @Column()
  action!: string;

  @Column()
  resource!: string;

  @Column()
  resourceId!: string;

  @Column('simple-json', { nullable: true })
  meta?: Record<string, any>;
}
