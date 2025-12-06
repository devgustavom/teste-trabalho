import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("stores")
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 150 })
  name: string;
  @Column({ type: "varchar", length: 20, unique: true, nullable: true })
  cnpj: string;
  @Column({ type: "varchar", length: 2 })
  state: string;
  @Column({ type: "varchar", length: 100, nullable: true })
  city: string;
  @Column({ type: "varchar", length: 150, nullable: true })
  address: string;
  @Column({ type: "varchar", length: 100, nullable: true })
  responsible: string;
  @Column({ type: "varchar", length: 30, nullable: true })
  phone: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
