import helmet from "helmet";
import xssClean from "xss-clean";
import hpp from "hpp";
import express from "express";

export const securityMiddleware = express.Router();

securityMiddleware.use(helmet());
securityMiddleware.use(xssClean());
securityMiddleware.use(hpp());