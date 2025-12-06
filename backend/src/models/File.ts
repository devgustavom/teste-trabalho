import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Supplier } from "./Supplier";

@Entity("files")
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier;

  @Column({ type: "varchar", length: 20 })
  file_type: string; // 'pdf', 'xls', 'image', etc.

  @Column({ type: "varchar", length: 255 })
  file_url: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
