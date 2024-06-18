import express from 'express'
import {
  getUserProfileHandler,
  updateAccountHandler,
  logoutHandler,
  signinHandler,
  signupHandler,
} from '../controllers/userController'
import isAuthenticated from '../middlewares/isAuthenticated'

const router = express.Router()

router.post('/signup', signupHandler)
router.post('/signin', signinHandler)
router.post('/signout', logoutHandler)
router.put('/update/:id', isAuthenticated, updateAccountHandler)
router.get('/profile/:id', isAuthenticated, getUserProfileHandler)

export default router
