 import Router from 'express';
import * as authService from './auth.service.js';
import * as validators from "./auth.validation.js"

import { validation } from '../../middleware/validation.middleware.js';

const router=Router();

router.post("/signup",validation(validators.signup),authService.Signup)
router.post("/login",validation(validators.login),authService.login)
router.patch("/send-reset-password",validation(validators.sendResetPasswordEmail),authService.sendResetPasswordEmail)
router.patch("/reset-password",validation(validators.resetPassword),authService.resetPassword)


export default router;