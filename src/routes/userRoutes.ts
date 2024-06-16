import express from 'express'
import {
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
  getOwnUserProfile,
} from '../controllers/userController'
import isAuthenticated from '../middlewares/isAuthenticated'
import isAdmin from '../middlewares/isAdmin'

const router = express.Router()

router.post('/signup', signupUser)
router.post('/signin', loginUser)
router.post('/signout', logoutUser)
router.put('/update/:id', isAuthenticated, updateUser)
router.get('/profile/:id', isAuthenticated, getUserProfile)
router.get('/me', isAuthenticated, isAdmin, getOwnUserProfile)

export default router
