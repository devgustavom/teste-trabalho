import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("suppliers")
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 150 })
  legal_name: string;
  @Column({ type: "varchar", length: 100, nullable: true })
  trade_name: string;
  @Column({ type: "varchar", length: 20, unique: true, nullable: true })
  cnpj: string;
  @Column({ type: "varchar", length: 2 })
  state: string;
  @Column({ type: "varchar", length: 100, nullable: true })
  city: string;
  @Column({ type: "varchar", length: 150, nullable: true })
  address: string;
  @Column({ type: "varchar", length: 100, nullable: true })
  contact_name: string;
  @Column({ type: "varchar", length: 30, nullable: true })
  contact_phone: string;
  @Column({ type: "varchar", length: 100, nullable: true })
  email: string;
  @Column({ type: "text", nullable: true })
  commercial_policy: string;
  @Column({ type: "varchar", length: 200, nullable: true })
  whatsapp_link: string;
  @Column({ type: "varchar", length: 100, nullable: true })
  category: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
