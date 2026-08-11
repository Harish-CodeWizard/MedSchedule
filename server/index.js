import express from 'express';
import cors from 'cors';
import connectDB from './database/dbConnection.js';
import cookieParser from "cookie-parser";
import userRouter from './routers/userRoute.js';
import patientRouter from './routers/patientRoute.js';
import otherRoute from './routers/otherActiveRoute.js';
import labRoute from './routers/labRoute.js';
import xrayRoute from './routers/xrayRoute.js';
import { errorMiddleware } from './middleware/error.js';
import { removeUnverifiedAccounts } from './automation/removeUnverifiedUsers.js';
import path from 'path';

export const app = express();

removeUnverifiedAccounts();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://10.0.2.2:19000",
  "http://192.168.100.12:19000",
];

//  CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));



// Middlewares
app.use(cookieParser());
// In your app.js or server.js
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads/xrays')));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// DB
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('API is running....');
});

app.use('/api/user', userRouter);
app.use('/api/patient', patientRouter);
app.use('/api/otherActive', otherRoute);
app.use('/api/lab', labRoute);
app.use('/api/xray', xrayRoute);

// Error handler
app.use(errorMiddleware);
