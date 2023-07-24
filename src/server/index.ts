import { config } from 'dotenv';
config(); //loads the configuration from the .env file
import * as express from 'express';
import sslRedirect from 'heroku-ssl-redirect';
import * as swaggerUi from 'swagger-ui-express';
import * as helmet from 'helmet';
import * as jwt from 'express-jwt';
import * as compression from 'compression';
import { getJwtTokenSignKey } from '../app/users/user';
import { api } from './api';
import * as fs from 'fs';

async function startup() {
  const app = express();
  app.use(sslRedirect());
  app.use(
    jwt({
      secret: getJwtTokenSignKey(),
      credentialsRequired: false,
      algorithms: ['HS256'],
    })
  );
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(api);
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(api.openApiDoc({ title: 'remult-react-todo' }))
  );

  const dist = process.cwd() + '/dist/angular-starter-project';
  app.get('/assets/logo.jpg', (req, res) => {
    let env = process.env['SCHEMA'] || '';

    let fn = dist + '/assets/' + env.toLowerCase() + '.jpg';
    if (fs.existsSync(fn)) {
      res.sendFile(fn);
    } else res.sendFile(dist + '/assets/logo.jpg');
  });

  app.use(express.static(dist));
  app.use('/*', async (req, res) => {
    try {
      let index = fs.readFileSync(dist + '/index.html').toString();
      if (process.env['TITLE']) {
        index = index.replace('בריאות אבן יהודה', process.env['TITLE']);
      }
      res.send(index);
    } catch (err) {
      res.sendStatus(500);
    }
  });
  let port = process.env['PORT'] || 3000;
  app.listen(port);
}
startup();
