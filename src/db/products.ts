import { Schema, model } from 'mongoose'

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export const ProductModel = model('Product', productSchema)

export const getProducts = () => ProductModel.find()

export const getProductById = (id: string) => ProductModel.findById(id)

export const createProduct = (values: Record<string, any>) =>
  new ProductModel(values).save().then((product) => product.toObject())

export const deleteProduct = (id: string) =>
  ProductModel.findOneAndDelete({ _id: id })

export const updateProduct = (id: string, values: Record<string, any>) =>
  ProductModel.findByIdAndUpdate(id, values).then((product) =>
    product?.toObject()
  )
