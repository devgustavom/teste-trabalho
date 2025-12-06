import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Supplier } from "./Supplier";

@Entity("campaigns")
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier;

  @Column({ type: "varchar", length: 100 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  banner_url: string;

  @Column("decimal", { precision: 12, scale: 2, nullable: true })
  target_amount: number;

  @Column("decimal", { precision: 12, scale: 2 })
  min_order_value: number;

  @Column({ type: "date", nullable: true })
  start_date: string;

  @Column({ type: "date", nullable: true })
  end_date: string;

  @Column({ type: "varchar", length: 20 })
  target_type: string; // 'general' (meta geral) ou 'individual' (sem meta)

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
