import { Controller, Post } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';

//cria a rota na api "/forecast 
@Controller('beaches')
export default class BeachesController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void>{
    const beach = new Beach(req.body);
    const result = await beach.save();
    res.status(201).send(result);
  }
}