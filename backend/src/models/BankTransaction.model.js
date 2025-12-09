import mongoose from "mongoose";

const BankTransactionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    reference: { type: String },
    description: { type: String },
    amount: { type: Number, required: true },
    runningBalance: { type: Number },
    transactionDateTime: { type: String },
    accountNumber: { type: String },
    bankName: { type: String },
    bankAbbreviation: { type: String },
    virtualAccountNumber: { type: String },
    virtualAccountName: { type: String },
    counterAccountName: { type: String },
    counterAccountNumber: { type: String },
    counterAccountBankId: { type: String },
    counterAccountBankName: { type: String },
  },
  { timestamps: true }
);

const BankTransaction = mongoose.model(
  "BankTransaction",
  BankTransactionSchema
);

export default BankTransaction;
