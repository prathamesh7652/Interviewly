import express from "express";
import { executeCode } from "../controller/executeController.js";

const router = express.Router();

router.post("/", executeCode);

export default router;
