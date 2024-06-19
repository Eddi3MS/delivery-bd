import { v2 as cloudinary } from 'cloudinary'
import { Request, Response } from 'express'
import { ProductModel } from '../db/products'
import {
  createProductSchema,
  updateProductSchema,
} from '../schemas/productSchema'
import generateErrorResponse from '../utils/generateErrorResponse'
import { CategoryModel } from '../db/categories'
import mongoose from 'mongoose'

async function createProductHandler(req: Request, res: Response) {
  try {
    const parsedBody = createProductSchema.safeParse(req.body)

    if (
      !parsedBody.success ||
      !mongoose.Types.ObjectId.isValid(parsedBody.data.category)
    ) {
      return generateErrorResponse({
        error: new Error('Invalid Params'),
        res,
        code: 400,
      })
    }

    const { name, category, description, image, price } = parsedBody.data

    const hasCategory = await CategoryModel.findById(category)

    if (!hasCategory) {
      return generateErrorResponse({
        error: new Error('Invalid category id'),
        res,
        code: 400,
      })
    }

    const uploadedResponse = await cloudinary.uploader.upload(image)

    let cloudImage = uploadedResponse.public_id

    const product = await ProductModel.create({
      name,
      category,
      description,
      price,
      image: cloudImage,
    })

    res.status(201).json(product)
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function updateProductHandler(req: Request, res: Response) {
  try {
    const parsedBody = updateProductSchema.safeParse(req.body)
    const { id } = req.params

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id) ||
      !parsedBody.success ||
      (parsedBody.data?.category &&
        !mongoose.Types.ObjectId.isValid(parsedBody.data.category))
    ) {
      return generateErrorResponse({
        error: new Error('Invalid params'),
        res,
        code: 400,
      })
    }

    const { name, category, description, price } = parsedBody.data
    let { image } = parsedBody.data

    const currentProduct = await ProductModel.findById(id)

    const hasCategory = await CategoryModel.findById(category)

    if (!hasCategory) {
      return generateErrorResponse({
        error: new Error('Invalid category id'),
        res,
        code: 400,
      })
    }

    if (!currentProduct) {
      return generateErrorResponse({
        error: new Error('Product not found'),
        res,
        code: 400,
      })
    }

    if (image) {
      if (currentProduct.image) {
        await cloudinary.uploader.destroy(currentProduct.image)
      }
      const uploadedResponse = await cloudinary.uploader.upload(image)

      image = uploadedResponse.public_id
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      {
        ...(image && { image }),
        ...(category && { category }),
        ...(name && { name }),
        ...(price && { price }),
        ...(description && { description }),
      },
      { new: true }
    )

    res.status(201).json(product)
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function deleteProductHandler(req: Request, res: Response) {
  try {
    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(id))
      return generateErrorResponse({
        error: new Error('Invalid params'),
        res,
        code: 400,
      })

    const hasProductToDelete = await ProductModel.findById(id)

    if (!hasProductToDelete) {
      return generateErrorResponse({
        error: new Error('Product not found'),
        res,
        code: 400,
      })
    }

    await ProductModel.findByIdAndDelete(id)

    res.status(201).json({ message: 'Product deleted' })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function listProductsHandler(req: Request, res: Response) {
  try {
    const products = await ProductModel.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData',
        },
      },
      {
        $unwind: '$categoryData',
      },
      {
        $group: {
          _id: '$category',
          category: { $first: '$categoryData' },
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              description: '$description',
              image: '$image',
              price: '$price',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
              category: '$category',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: 1,
          products: 1,
        },
      },
      {
        $sort: {
          'category.order': -1,
        },
      },
    ])

    res.status(201).json(products)
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

export {
  createProductHandler,
  deleteProductHandler,
  listProductsHandler,
  updateProductHandler,
}
