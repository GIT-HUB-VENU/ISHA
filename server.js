import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleDesktopCommand } from './desktopAutomation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/command', async (req, res) => {
  const { command } = req.body;
  try {
    const result = await handleDesktopCommand(command || '');
    res.json(result);
  } catch (err) {
    console.error('Error handling desktop command:', err);
    res.status(500).json({
      success: false,
      intent: 'ERROR',
      response: "I couldn't complete that operation.",
      status: 'FAILED',
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`I.S.H.A Automation Server running on http://localhost:${PORT}`);
});
