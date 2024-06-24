import express from 'express'
import isAuthenticated from '../middlewares/isAuthenticated'
import isAdmin from '../middlewares/isAdmin'
import {
  createOrderHandler,
  listOrdersHandler,
  listOwnOrdersHandler,
  deleteOrderHandler,
  updateOrderHandler,
} from '../controllers/orderController'

const router = express.Router()

router.get('/list/:id', isAuthenticated)
router.post('/create', isAuthenticated, createOrderHandler)
router.put('/update/:id', isAuthenticated, isAdmin, updateOrderHandler)
router.delete('/delete/:id', isAuthenticated, isAdmin, deleteOrderHandler)
router.get('/all', isAuthenticated, isAdmin, listOrdersHandler)
router.get('/own', isAuthenticated, listOwnOrdersHandler)

export default router
