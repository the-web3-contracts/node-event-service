import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    BlocksEntity,
    ContractEventEntity
} from 'src/typeorm';
import { EntityManager, getManager, Repository } from 'typeorm';
import Web3 from 'web3';
import { HttpService } from '@nestjs/axios';
import { Gauge } from "prom-client";
import { InjectMetric } from "@willsoto/nestjs-prometheus";

@Injectable()
export class SynchronizerService {
    private readonly logger = new Logger(SynchronizerService.name);
    entityManager: EntityManager;
    web3: Web3;
    treasureManagerContract: any;

    constructor(
        private configService: ConfigService,
        @InjectRepository(BlocksEntity)
        private readonly blocksRepository: Repository<BlocksEntity>,
        @InjectRepository(ContractEventEntity)
        private readonly contractEventEntityRepository: Repository<ContractEventEntity>,
        private readonly httpService: HttpService,
        @InjectMetric('stark_block')
        public metricStartBlock: Gauge<string>,
        @InjectMetric('end_block')
        public metricEndBlock: Gauge<string>,

    ) {
        this.entityManager = getManager();
        const web3 = new Web3(
            new Web3.providers.HttpProvider(configService.get('RPC_URL')),
        );

        this.web3 = web3;
    }

    async getCurrentBlockNumber(): Promise<number> {
        return this.web3.eth.getBlockNumber();
    }

    async getBlockNumber(): Promise<number> {
        const result = await this.blocksRepository
            .createQueryBuilder()
            .select('Max(block_number)', 'blockNumber')
            .getRawOne();
        return Number(result.blockNumber) || 0;
    }

    async eventScanner() {
        console.log("======== event scanner ========")
    }
}
