import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlocksEntity } from 'src/typeorm';
import { EntityManager, getConnection, getManager, Repository } from 'typeorm';
import { Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { HttpService } from '@nestjs/axios';
import {FrontendController} from "./frontend.controller";
const BigNumber = require('bignumber.js');
const { v4: uuidv4 } = require('uuid');


@Injectable()
export class FrontendService {
    private readonly logger = new Logger(FrontendService.name);
    constructor(
        private configService: ConfigService,
        @InjectRepository(BlocksEntity)
        private readonly addresses: Repository<BlocksEntity>,
        private readonly httpService: HttpService,
    ) {}

    async getDepositTokenList() {

    }

    async getDepositTokenDetail(params: any) {

    }

    async testApi() {
        return true
    }
}
