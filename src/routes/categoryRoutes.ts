import express from 'express'
import isAuthenticated from '../middlewares/isAuthenticated'
import isAdmin from '../middlewares/isAdmin'
import {
  createCategoryHandler,
  deleteCategoryHandler,
  reorderHandler,
  updateCategoryHandler,
  listCategoriesHandler,
} from '../controllers/categoryController'

const router = express.Router()

router.get('/list', listCategoriesHandler)
router.post('/create', isAuthenticated, isAdmin, createCategoryHandler)
router.put('/update/:id', isAuthenticated, isAdmin, updateCategoryHandler)
router.delete('/delete/:id', isAuthenticated, isAdmin, deleteCategoryHandler)
router.put('/reorder', isAuthenticated, isAdmin, reorderHandler)

export default router
