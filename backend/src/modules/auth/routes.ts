import { Router } from 'express'

import { requireAuth } from '../../middleware/auth.js'
import {
  loginController,
  logoutController,
  meController,
  signupController,
} from './controllers.js'

const router: Router = Router()

router.post('/auth/signup', signupController)
router.post('/auth/login', loginController)
router.get('/auth/me', requireAuth, meController)
router.post('/auth/logout', logoutController)

export default router
