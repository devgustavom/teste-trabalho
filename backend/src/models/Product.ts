import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Supplier } from "./Supplier";
import { Category } from "./Category";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column("decimal", { precision: 12, scale: 2 })
  price: number;

  @Column({ type: "int", default: 0 })
  stock: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  image_url: string;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
