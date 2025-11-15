import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'low' })
  priority!: 'low' | 'medium' | 'high';

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date;

  @Column({ default: 'todo' })
  status!: 'todo' | 'doing' | 'done';

  @Column({ default: 'Work' })
  category!: 'Work' | 'Personal';

  @Column({ type: 'int', default: 0 })
  position!: number;

  @ManyToOne(() => Organization, { eager: true })
  org!: Organization;

  @Column()
  createdByUserId!: string;
}
