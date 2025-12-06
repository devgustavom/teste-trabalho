import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Order } from "./Order";
import { Store } from "./Store";

@Entity("cashback_entries")
export class CashbackEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: "order_id" })
  order: Order;
  @ManyToOne(() => Store)
  @JoinColumn({ name: "store_id" })
  store: Store;

  @Column("decimal", { precision: 12, scale: 2 })
  value: number;

  @Column({ type: "boolean", default: false })
  confirmed: boolean;

  @Column({ type: "int", nullable: true })
  withdrawal_request_id: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  proof_file_url: string;

  @CreateDateColumn()
  created_at: Date;
}
