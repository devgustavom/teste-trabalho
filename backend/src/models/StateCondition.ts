import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Supplier } from "./Supplier";

@Entity("state_conditions")
export class StateCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier;

  @Column({ type: "varchar", length: 2 })
  state: string;
  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  cashback_percent: number;
  @Column({ type: "int", nullable: true })
  payment_term: number;
  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  unit_adjustment: number;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
