import express from "express";
import serverless from "serverless-http";
import apiRouter from "../../api";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use("/.netlify/functions/api", apiRouter);
app.use("/api", apiRouter);

export const handler = serverless(app);
