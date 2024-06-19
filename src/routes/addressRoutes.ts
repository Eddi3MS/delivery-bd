import express from 'express'
import isAuthenticated from '../middlewares/isAuthenticated'
import {
  createAddressHandler,
  listAddressesHandler,
  deleteAddressHandler,
  updateAddressHandler,
} from '../controllers/addressController'

const router = express.Router()

router.get('/list', isAuthenticated, listAddressesHandler)
router.post('/create', isAuthenticated, createAddressHandler)
router.put('/update/:id', isAuthenticated, updateAddressHandler)
router.delete('/delete/:id', isAuthenticated, deleteAddressHandler)

export default router
