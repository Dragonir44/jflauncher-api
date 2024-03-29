import dotenv from 'dotenv';
import app from './app/index';
import fs from 'fs';

// load environment variables
dotenv.config()

if (fs.existsSync(<string>process.env.TOKEN_FILE)) {
  process.env.TOKEN = fs.readFileSync(<string>process.env.TOKEN_FILE, 'utf8').trim()
  console.log('Token loaded from file')
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});