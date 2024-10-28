const express = require("express");
const mainRouter = require('./routes/index.js');
const connectDB = require('./db.js');
var cors = require('cors');
const app = express();
const PORT = 3000;

connectDB();
app.use(cors({ origin: 'https://payzip-zeta.vercel.app' }));
app.use(express.json());

app.use("/api/v1",mainRouter);






app.listen(PORT,()=>console.log(`server is running at ${PORT}`));;