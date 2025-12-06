import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Campaign } from "./Campaign";
import { Product } from "./Product";

@Entity("campaign_products")
export class CampaignProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Campaign)
  @JoinColumn({ name: "campaign_id" })
  campaign: Campaign;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product;
}
