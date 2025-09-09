import { Router } from 'express';
import { fetchGitLabIssues } from '../connectors/gitlab';
import { fetchOpenProjectWorkPackages } from '../connectors/openproject';

const router = Router();

router.get('/items', async (_req, res, next) => {
  try {
    const [gitlab, openproject] = await Promise.all([
      fetchGitLabIssues(),
      fetchOpenProjectWorkPackages(),
    ]);
    res.json({ items: [...gitlab, ...openproject] });
  } catch (err) {
    next(err);
  }
});

export default router;
