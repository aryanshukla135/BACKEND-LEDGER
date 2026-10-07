const express = require('express');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.routes');
const accountRouter = require('./routes/account.routes');
const transactionRoutes = require("./routes/transaction.routes");
const app = express();

app.use(express.json()); // => middleware
// it is used to parse the incoming request body in JSON format and make it available in req.body. This is particularly useful when working with APIs that send data in JSON format, as it allows you to easily access and manipulate the data sent by the client.
app.use(cookieParser());
app.use('/api/auth',authRouter);
app.use("/api/accounts",accountRouter);
app.use("/api/transactions",transactionRoutes);




module.exports = app;

