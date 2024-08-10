import mongoose, { Document, Model, Schema } from "mongoose";

interface Product {
  productName: string;
  productID: string;
}

interface LeadDocument extends Document {
  name: string;
  email: string;
  number: number;
  product: Product;
}

const leadSchema: Schema<LeadDocument> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    product: {
      productName: {
        type: String,
        required: true,
      },
      productID: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Lead: Model<LeadDocument> = mongoose.model<LeadDocument>(
  "Lead",
  leadSchema
);

export default Lead;
