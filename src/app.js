const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());

/**
 * - Routes Required
 */
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const transactionRutes = require('./routes/transaction.routes');

/**
 * - Use Routes
 */

app.get('/', (req, res)=>{
    res.send("Ledger service is up and runing")// This api for server is runing or not at live
})
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRutes);

module.exports = app;