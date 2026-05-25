import express from 'express';
import cors from 'cors';
import scansRouter from './routes/scans';
import vulnerabilitiesRouter from './routes/vulnerabilities';
import remediationsRouter from './routes/remediations';
import exportsRouter from './routes/exports';

const app = express();
const PORT = process.env.PORT || 42001;

app.use(cors());
app.use(express.json());

app.use('/api/scans', scansRouter);
app.use('/api/vulnerabilities', vulnerabilitiesRouter);
app.use('/api/remediations', remediationsRouter);
app.use('/api/exports', exportsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SBOM Compass API running on port ${PORT}`);
});

export default app;
