const {Router} = require('express');
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");
const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const mongoose = require("mongoose");
const emailServices = require("../services/email.service");
const { createTransaction, createInitialFundsTransaction } = require('../controllers/transaction.controller');
const { authMiddleware: authUserMiddleware, authSystemUserMiddleware } = require('../middleware/auth.middleware');
const transactionRoutes = Router();



transactionRoutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction);
 

transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction);    

module.exports = transactionRoutes;