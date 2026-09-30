import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import wellsRoutes from './routes/wells.routes';
import energyRoutes from './routes/energy.routes';
import vapiRoutes from './routes/vapi.routes';
import operationsRoutes from './routes/operations.routes';

// Routes will be registered here
app.use('/api/wells', wellsRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/vedas', vapiRoutes);
app.use('/api/operations', operationsRoutes);


app.listen(PORT, () => {
  console.log(`NWIS Backend running on port ${PORT}`);
});
