const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const mongoose = require('mongoose');
const emailService = require('../services/email.service');

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency Key
 * 3. Check Account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req, res) {
    /**
     * 1. Validate request
     */
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey is required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount // This does work like ===> _id: "1111111235555555555555" this field will be match db/account data
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message: "Invalid fromAccount and toAccount"
        })
    }


    /**
     * 2. Validate idempotency Key
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if(isTransactionAlreadyExists){

        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still processing"
            })
        }
        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }
        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }

    /**
     * 3. Check Account status
     */
    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }

    /**
     * 4. Derive sender balance from ledger
     */
    const balance = await accountModel.getBalance();

    if(balance < amount){
        res.status(400).json({
            message: `Insufficent balance. Current balance is ${balance}. Requested balance is ${amount}`
        })
    }

    /**
     * 5. Create transaction (PENDING)
     */
    const session = await mongoose.startSession();
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }, { session });

    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
    }, { session });

    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
    }, { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    /**
     * 10. Send email notification
     */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

    res.status(201).json({
        message: "Transaction created succesfully!",
        transaction: transaction
    })


}

async function createInitialFundsTransaction(req, res){
        
    const {toAccount, amount, idempotencyKey} = req.body;

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        systemUser: true,
        user: req.user._id
    })

    if(!fromUserAccount){
        return res.status(400).json({
            message: "System user account not find"
        })
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = await transactionModel.create({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }, { session });

    


}

module.exports = {createTransaction, createInitialFundsTransaction};