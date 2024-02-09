import dotenv from 'dotenv';
import app from './app/index';

// load environment variables
dotenv.config()

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});