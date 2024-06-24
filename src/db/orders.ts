import { Schema, model } from 'mongoose'

const addressSchema = new Schema({
  street: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  complement: {
    type: String,
    default: '',
  },
  neighborhood: {
    type: String,
    required: true,
  },
})

const orderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
})

const orderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: addressSchema,
    items: [orderItemSchema],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'],
      default: 'PENDING',
    },
    message: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

export const OrderModel = model('Order', orderSchema)
