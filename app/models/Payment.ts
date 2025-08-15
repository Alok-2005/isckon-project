import { InferSchemaType, model, Schema } from 'mongoose';
import * as mongoose from 'mongoose';

const PaymentSchema = new Schema({
  name: { type: String, required: true },
  contactNo: { type: String, required: true },
  amount: { type: Number, required: true },
  purpose:{type:String,required:true},
  transactionId: { type: String, required: true },
  oid: { type: String },  // Made optional (remove 'required: true')
  to_user: { type: String, required: true },
  done: { type: Boolean, default: false },
  upiId: { type: String },
  razorpayPaymentId: { type: String },
  updatedAt: { type: Date },
  method: { type: String, default: "online" },  // Added for cash/online distinction
});

export type PaymentDocument = InferSchemaType<typeof PaymentSchema>;

export default mongoose.models.Payment || model<PaymentDocument>("Payment", PaymentSchema);
