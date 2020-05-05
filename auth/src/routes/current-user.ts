import express from 'express';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
  res.send('get current user route mod');
});

export { router as currentUserRouter };
