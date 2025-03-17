import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

dotenv.config();

// Import the routes
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Serve static files from the client dist folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// ✅ Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect the API routes
app.use('/api', routes);

// ✅ Serve the frontend for any unknown routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ✅ Start the server
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
