 import Router from 'express';
import * as authService from './auth.service.js';

const router=Router();

router.post("/signup",authService.Signup)
router.post("/login",authService.login)



export default router;