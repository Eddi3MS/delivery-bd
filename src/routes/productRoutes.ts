import express from 'express'
import isAuthenticated from '../middlewares/isAuthenticated'
import isAdmin from '../middlewares/isAdmin'
import {
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  listProductsHandler,
} from '../controllers/productController'

const router = express.Router()

router.get('/list', listProductsHandler)
router.post('/create', isAuthenticated, isAdmin, createProductHandler)
router.put('/update/:id', isAuthenticated, isAdmin, updateProductHandler)
router.delete('/delete/:id', isAuthenticated, isAdmin, deleteProductHandler)

export default router
