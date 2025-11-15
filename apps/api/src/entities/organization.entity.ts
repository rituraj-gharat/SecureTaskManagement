import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @ManyToOne(() => Organization, (organization) => organization.children, { nullable: true })
  parent?: Organization | null;

  @OneToMany(() => Organization, (organization) => organization.parent)
  children!: Organization[];
}
