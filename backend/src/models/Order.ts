import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Store } from "./Store";
import { Supplier } from "./Supplier";
import { Campaign } from "./Campaign";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Store)
  @JoinColumn({ name: "store_id" })
  store: Store;
  @ManyToOne(() => Supplier)
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier;
  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn({ name: "campaign_id" })
  campaign: Campaign;

  @Column({ type: "varchar", length: 20 })
  status: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  payment_type: string;

  @Column({ type: "boolean", default: false })
  is_budget: boolean;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column("decimal", { precision: 12, scale: 2 })
  subtotal: number;
  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  tax: number;
  @Column("decimal", { precision: 12, scale: 2 })
  total: number;
  
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
