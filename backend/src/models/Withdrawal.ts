import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Store } from "./Store";

@Entity("withdrawals")
export class Withdrawal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Store)
  @JoinColumn({ name: "store_id" })
  store: Store;

  @Column({ type: "varchar", length: 100 })
  pix_key: string;

  @Column("decimal", { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: "varchar", length: 20 })
  status: string;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
