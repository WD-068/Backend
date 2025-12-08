import express from 'express';
import cookieParser from 'cookie-parser';
import '#db';
import { authRouter, userRouter } from '#routers';
import { authenticate, authorize, errorHandler } from '#middlewares';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.post('/protected', authenticate, authorize(['admin', 'reader']), (req, res) => {
  res.json({ message: 'You requested a protected route' });
});
app.post('/protected/:id', authenticate, authorize(['admin', 'self']), (req, res) => {
  res.json({ message: 'You requested a protected route' });
});

app.use('*splat', (req, res) => {
  throw new Error('Not found!', { cause: 404 });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
