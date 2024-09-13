import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Define a custom transformer for the vector type
const vectorTransformer = {
  to: (value: number[]): string => JSON.stringify(value), // Convert to string for storage
  from: (value: string): number[] => JSON.parse(value) // Convert back to array when reading
};

@Entity()
export class PdfEmbedding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pageNumber: number;

  @Column('text')
  text: string;

  @Column('text', { transformer: vectorTransformer }) // Use text with transformer
  embedding: number[]; // Use number array
}
