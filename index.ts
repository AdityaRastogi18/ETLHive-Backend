import "dotenv/config";
import express from "express";
import cors from "cors";
import userRouter from "./routes/user";
import leadRouter from "./routes/leads";
import { connectDB } from "./config/connectDB";

connectDB();

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.options(
  "*",
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", userRouter);
app.use("/leads", leadRouter);

app.listen(PORT || 3003, () => {
  console.log("server has started");
});
