import express from 'express';
import cors from 'cors';
import uploadRouter from './routes/upload';
import queryRouter from './routes/query';
import { DataSource } from 'typeorm';
import { pdfEmbedding } from './entities/DocumentEmbedding';

export const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'myuser',
  password: 'mypassword',
  database: 'mydatabase',
  entities: [pdfEmbedding],
  synchronize: true,
});

const app = express();

app.use(cors());
app.use(express.json());

dataSource
  .initialize()
  .then(() => {
    app.listen(3001, () => {
      console.log('Server running on port 3001');
      app.use('/api', uploadRouter);
      app.use('/api', queryRouter);

    });
  })
  .catch((error) => {
    console.error('Error initializing data source:', error);
  });


  