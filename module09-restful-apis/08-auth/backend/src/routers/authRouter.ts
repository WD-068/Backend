import { Router } from 'express';
import { register, login, logout, me } from '#controllers';
import { authenticate, validateBody } from '#middlewares';
import { userInputSchema } from '#schemas';

const authRouter = Router();

authRouter.post('/register', validateBody(userInputSchema), register);

authRouter.post('/login', login);

authRouter.delete('/logout', logout);

authRouter.get('/me', authenticate, me);

export default authRouter;
