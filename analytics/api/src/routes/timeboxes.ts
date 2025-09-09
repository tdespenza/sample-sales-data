import { Router } from 'express';
import { fetchGitLabMilestones } from '../connectors/gitlab';
import { fetchOpenProjectVersions } from '../connectors/openproject';

const router = Router();

router.get('/timeboxes', async (_req, res, next) => {
  try {
    const [gitlab, openproject] = await Promise.all([
      fetchGitLabMilestones(),
      fetchOpenProjectVersions(),
    ]);
    res.json([...gitlab, ...openproject]);
  } catch (err) {
    next(err);
  }
});

export default router;
