import { Router } from 'express';
const router = Router();
router.get('/config', (_req, res) => {
  const cfg = {
    gitlab: Boolean(process.env.GITLAB_BASE_URL && process.env.GITLAB_PROJECT_ID),
    openproject: Boolean(process.env.OP_BASE_URL && process.env.OP_PROJECT_ID),
    gitlabProjectId: process.env.GITLAB_PROJECT_ID,
    openProjectId: process.env.OP_PROJECT_ID,
  };
  res.json(cfg);
});
export default router;
