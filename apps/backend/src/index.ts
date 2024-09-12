import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";
import { UserEntity } from "./entity/UserEntity";

const app = express();
const port = 3001;

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "myuser",
  password: "mypassword",
  database: "mydatabase",
  entities: [UserEntity],
  synchronize: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.get("/", (req, res) => {
  res.send("Hello from the Express API!");
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
