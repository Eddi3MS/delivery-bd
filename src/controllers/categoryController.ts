import { Request, Response } from 'express'
import mongoose from 'mongoose'
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  updateOrder,
} from '../db/categories'
import {
  categorySchema,
  updateCategoriesOrder,
} from '../schemas/categorySchema'
import generateErrorResponse from '../utils/generateErrorResponse'

async function createCategoryHandler(req: Request, res: Response) {
  try {
    const parsedBody = categorySchema.safeParse(req.body)

    if (!parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Invalid Params'),
        res,
        code: 400,
      })
    }

    const { name } = parsedBody.data

    const slug = name.toUpperCase().replace(' ', '-')

    const hasCategory = await getCategoryBySlug(slug)

    if (!!hasCategory) {
      return generateErrorResponse({
        error: new Error('Category name already in use'),
        res,
        code: 400,
      })
    }

    const category = await createCategory({ name, slug })

    res.status(201).json({
      _id: category._id,
      name: category.name,
      order: category.order,
    })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function updateCategoryHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    const parsedBody = categorySchema.safeParse(req.body)

    if (!id || !mongoose.Types.ObjectId.isValid(id) || !parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Invalid params'),
        res,
        code: 400,
      })
    }

    const hasCategoryToUpdate = await getCategoryById(id)

    if (!hasCategoryToUpdate) {
      return generateErrorResponse({
        error: new Error('Category not found'),
        res,
        code: 400,
      })
    }

    const { name } = parsedBody.data

    const slug = name.toUpperCase().replace(' ', '-')

    const nameAlreadyInUse = await getCategoryBySlug(slug)

    if (!!nameAlreadyInUse) {
      return generateErrorResponse({
        error: new Error('Category name already in use'),
        res,
        code: 400,
      })
    }

    await updateCategory(id, { name, slug })

    res.status(201).json({ message: 'Category updated' })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function deleteCategoryHandler(req: Request, res: Response) {
  try {
    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(id))
      return generateErrorResponse({
        error: new Error('Invalid params'),
        res,
        code: 400,
      })

    const hasCategoryToDelete = await getCategoryById(id)

    if (!hasCategoryToDelete) {
      return generateErrorResponse({
        error: new Error('Category not found'),
        res,
        code: 400,
      })
    }

    await deleteCategory(id)

    res.status(201).json({ message: 'Category deleted' })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function reorderHandler(req: Request, res: Response) {
  try {
    const parsedBody = updateCategoriesOrder.safeParse(req.body)

    if (!parsedBody.success) {
      return generateErrorResponse({
        error: new Error('Invalid Params'),
        res,
        code: 400,
      })
    }

    await updateOrder(parsedBody.data)

    res.status(201).json({ message: 'Order updated' })
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

async function listCategoriesHandler(req: Request, res: Response) {
  try {
    const categories = await getCategories()

    res.status(201).json(categories)
  } catch (error) {
    generateErrorResponse({ error, res })
  }
}

export {
  createCategoryHandler,
  deleteCategoryHandler,
  listCategoriesHandler,
  reorderHandler,
  updateCategoryHandler,
}
