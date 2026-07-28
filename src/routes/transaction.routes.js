const { Router } = require('express')
const authMiddleware = require('../middleware/auth.middleware');

const transactionRutes = Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */

transactionRutes.post("/", authMiddleware.authMiddleware);

module.exports = transactionRutes;