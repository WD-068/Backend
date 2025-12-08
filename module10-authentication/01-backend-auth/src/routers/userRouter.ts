import { Router } from 'express';
import { authenticate, authorize, validateBody, validateParams } from '#middlewares';
import { userInputSchema, userParamsSchema } from '#schemas';
import { getAllUsers, createUser, getUserById, updateUser, deleteUser } from '#controllers';

const userRouter = Router();

userRouter.route('/').get(getAllUsers).post(validateBody(userInputSchema), createUser);

userRouter
  .route('/:id')
  .all(validateParams(userParamsSchema))
  .get(getUserById)
  .put(authenticate, authorize(['admin', 'self']), validateBody(userInputSchema), updateUser)
  .delete(deleteUser);

export default userRouter;
