import { Request, Response } from 'express'
import generateErrorResponse from '../utils/generateErrorResponse'
import { createProductSchema } from '../schemas/productSchema'
import { v2 as cloudinary } from 'cloudinary'
import { ProductModel, createProduct } from '../db/products'

async function createProductHandler(req: Request, res: Response) {
  try {
    const parsedBody = createProductSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Invalid Params'),
        res,
        code: 400,
      })
    }

    const { name, category, description, image, price } = parsedBody.data

    const uploadedResponse = await cloudinary.uploader.upload(image)

    let cloudImage = uploadedResponse.public_id

    const product = await createProduct({
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
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function deleteProductHandler(req: Request, res: Response) {
  try {
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
  updateProductHandler,
  deleteProductHandler,
  listProductsHandler,
}
