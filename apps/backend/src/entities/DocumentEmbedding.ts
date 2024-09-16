import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class pdfEmbedding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  chunkIndex: number;

  @Column("text")
  text: string;

  @Column("float", { array: true })
  embedding: number[];

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}