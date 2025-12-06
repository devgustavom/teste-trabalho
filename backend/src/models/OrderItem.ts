import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "int", default: 1 })
  quantity: number;

  @Column("decimal", { precision: 12, scale: 2 })
  unit_price: number;
  @Column("decimal", { precision: 12, scale: 2 })
  total_price: number;
}
