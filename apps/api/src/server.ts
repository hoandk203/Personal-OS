import { createApplication } from './presentation/http/app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const { app } = createApplication();

app.listen(PORT, () => {
  console.log(`[PersonalOS] API Server running on port ${PORT}`);
  console.log(`[PersonalOS] Health check: http://localhost:${PORT}/health`);
});
