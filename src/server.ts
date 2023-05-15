import { Application } from 'express';
import ForecastController from './controllers/forecast';
import './utils/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';

export default class SetupServer extends Server {
  constructor(private port = 3003) {
    super();
  }

  public initServer(): void {
    this.setupExpress();
    this.setupController();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }
  //inicializa as rotas
  private setupController(): void {
    const forecastController = new ForecastController();
    this.addControllers([forecastController]);
  }

  public getApp(): Application {
    return this.app;
  }
}
