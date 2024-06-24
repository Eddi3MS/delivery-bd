import { Request, Response } from 'express'
import { get } from 'lodash'
import mongoose from 'mongoose'
import { OrderModel } from '../db/orders'
import { ProductModel } from '../db/products'
import { createOrderSchema, updateOrderSchema } from '../schemas/orderSchema'
import generateErrorResponse from '../utils/generateErrorResponse'

async function createOrderHandler(req: Request, res: Response) {
  try {
    const parsedBody = createOrderSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Invalid Parameters'),
        res,
        code: 400,
      })
    }

    const { address, items, total } = parsedBody.data

    const productIds = items.map((item) => item.product)

    const allProductsHaveValidIds = productIds.every((id) =>
      mongoose.Types.ObjectId.isValid(id)
    )

    if (!allProductsHaveValidIds) {
      return generateErrorResponse({
        error: new Error('Invalid product id'),
        res,
        code: 400,
      })
    }

    const dbProducts = await ProductModel.find({ _id: { $in: productIds } })

    if (dbProducts.length !== productIds.length) {
      return generateErrorResponse({
        error: new Error('Product not found.'),
        res,
        code: 400,
      })
    }

    const dbProductsPrice: Record<string, number> = {}

    dbProducts.forEach((p) => {
      const idStr = p._id.toString()

      dbProductsPrice[idStr] = p.price
    })

    const dbSumBased = items.reduce((acc, att) => {
      acc += att.quantity * dbProductsPrice[att.product]
      return acc
    }, 0)

    if (dbSumBased !== total) {
      return generateErrorResponse({
        error: new Error('Total amount mismatch'),
        res,
        code: 400,
      })
    }

    const currUserId = get(req, 'user._id') as unknown as string

    const order = await OrderModel.create({
      address,
      items,
      total,
      customer: currUserId,
    })

    res.status(201).json(order)
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function updateOrderHandler(req: Request, res: Response) {
  try {
    const parsedBody = updateOrderSchema.safeParse(req.body)

    if (!parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Invalid status'),
        res,
        code: 400,
      })
    }

    const { status, message } = parsedBody.data

    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return generateErrorResponse({
        error: new Error('Invalid order id'),
        res,
        code: 400,
      })
    }

    const hasOrderToUpdate = await OrderModel.findById(id)

    if (!hasOrderToUpdate) {
      return generateErrorResponse({
        error: new Error('Order not found'),
        res,
        code: 400,
      })
    }

    await OrderModel.findByIdAndUpdate(id, {
      status,
      ...(message && { message }),
    })

    res.status(201).json({ message: 'Order updated' })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function deleteOrderHandler(req: Request, res: Response) {
  try {
    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return generateErrorResponse({
        error: new Error('Invalid parameters'),
        res,
        code: 400,
      })
    }

    const hasOrderToDelete = await OrderModel.findById(id)

    if (!hasOrderToDelete) {
      return generateErrorResponse({
        error: new Error('Order not found'),
        res,
        code: 400,
      })
    }

    await OrderModel.findByIdAndDelete(id)

    res.status(201).json({ message: 'Order deleted' })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function listOrdersHandler(req: Request, res: Response) {
  try {
    const orders = await OrderModel.aggregate([
      {
        $group: {
          _id: '$status',
          orders: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          orders: 1,
        },
      },
      {
        $sort: { status: 1 },
      },
    ])

    res.status(201).json(orders)
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function listOwnOrdersHandler(req: Request, res: Response) {
  try {
    const currUserId = get(req, 'user._id') as unknown as string

    const orders = await OrderModel.find({ customer: currUserId })

    res.status(201).json(orders)
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

export {
  createOrderHandler,
  deleteOrderHandler,
  listOrdersHandler,
  listOwnOrdersHandler,
  updateOrderHandler,
}
