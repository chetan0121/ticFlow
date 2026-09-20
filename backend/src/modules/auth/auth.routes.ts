import { Router, type Router as ExpressRouter } from 'express'

import { asyncHandler } from '../../middleware/async-handler.js'
import { authenticate } from '../../middleware/authenticate.js'
import { handleLogin, handleLogout, handleMe, handleSignup } from './auth.controller.js'

export const authRouter: ExpressRouter = Router()

authRouter.post('/signup', asyncHandler(handleSignup))
authRouter.post('/login', asyncHandler(handleLogin))
authRouter.get('/me', asyncHandler(authenticate), handleMe)
authRouter.post('/logout', asyncHandler(handleLogout))
