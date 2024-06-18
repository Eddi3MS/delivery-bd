import { Schema, model } from 'mongoose'

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

export const CategoryModel = model('Category', categorySchema)
