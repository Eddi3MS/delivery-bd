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

export const getCategories = () => CategoryModel.find().sort({ order: -1 })

export const getCategoryById = (id: string) => CategoryModel.findById(id)

export const getCategoryBySlug = (slug: string) =>
  CategoryModel.findOne({ slug })

export const createCategory = (values: Record<string, any>) =>
  new CategoryModel(values).save().then((category) => category.toObject())

export const deleteCategory = (id: string) =>
  CategoryModel.findOneAndDelete({ _id: id })

export const updateCategory = (id: string, values: Record<string, any>) =>
  CategoryModel.findByIdAndUpdate(id, values).then((category) =>
    category?.toObject()
  )

export const updateOrder = async (order: { id: string; order: number }[]) => {
  const bulkOps = order.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id },
      update: { order },
    },
  }))

  await CategoryModel.bulkWrite(bulkOps)
}
