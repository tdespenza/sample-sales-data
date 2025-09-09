import express from 'express';
import health from './routes/health';
import config from './routes/config';
import items from './routes/items';
import timeboxes from './routes/timeboxes';

const app = express();

app.use(health);
app.use(config);
app.use(items);
app.use(timeboxes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'internal error' });
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`API listening on ${port}`);
  });
}

export default app;
