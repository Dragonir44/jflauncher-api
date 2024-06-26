import dotenv from 'dotenv';
import app from './app/index';
import fs from 'fs';
import swaggerDocs from './app/routes/swagger.router';
import { init } from './app/services/channel.service';
import { initNews } from './app/services/news.service';

// load environment variables
dotenv.config()

if (fs.existsSync(<string>process.env.TOKEN_FILE)) {
  process.env.TOKEN = fs.readFileSync(<string>process.env.TOKEN_FILE, 'utf8').trim()
  console.log('Token loaded from file')
}

const PORT = process.env.PORT || 5000;
  
init().then((channels) => {
  initNews().then(() => {
    console.log(`Channels: ${channels.length}`)
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      swaggerDocs(app, Number(PORT));
    });
  })
})