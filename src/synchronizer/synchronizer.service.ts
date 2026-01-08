import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    BlocksEntity,
    ContractEventEntity
} from 'src/typeorm';
import { EntityManager, getManager, Repository } from 'typeorm';
import Web3 from 'web3';
import { Log } from "web3-core";
import { HttpService } from '@nestjs/axios';
import { Gauge } from "prom-client";
import { InjectMetric } from "@willsoto/nestjs-prometheus";

const START_BLOCK = 1000;
const SYNC_BLOCK_STEP = 500;
const CONTRACTS_ADDRESSES = [];


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

    async getChainBlockNumber(): Promise<number> {
        return this.web3.eth.getBlockNumber();
    }

    async getChainLogs(
        fromBlock: number,
        toBlock: number,
        address?: string[] | string
    ): Promise<Log[]> {
        return await this.web3.eth.getPastLogs({
            fromBlock,
            toBlock,
            address
        });
    }

    async getBlockNumber(): Promise<number> {
        const result = await this.blocksRepository
            .createQueryBuilder()
            .select('Max(number)', 'blockNumber')
            .getRawOne();
        return Number(result.blockNumber) || 0;
    }

    async eventScanner() {
        const dbLatestBlock = await this.getBlockNumber();
        const chainLatestBlock = await this.getChainBlockNumber();
        let fromBlock: number;
        if (dbLatestBlock === 0) {
            fromBlock = START_BLOCK;
        } else {
            fromBlock = dbLatestBlock + 1;
        }
        if (fromBlock >= chainLatestBlock) {
            this.logger.log(
                `No new blocks to sync. db=${dbLatestBlock}, chain=${chainLatestBlock}`,
            );
            return;
        }
        const toBlock = Math.min(
            fromBlock + SYNC_BLOCK_STEP,
            chainLatestBlock
        );
        this.metricStartBlock.set(fromBlock);
        this.metricEndBlock.set(toBlock);
        this.logger.log(
            `Sync blocks from ${fromBlock} to ${toBlock}, chainLatest=${chainLatestBlock}`,
        );
        try {
            const logs = await this.getChainLogs(
                fromBlock,
                toBlock,
                CONTRACTS_ADDRESSES,
            );
            this.logger.log(`Fetched ${logs.length} logs`);

            await this.entityManager.transaction(
                async (manager) => {
                    await this.saveContractEvents(manager, logs);
                    await this.saveBlocksInRange(
                        manager,
                        fromBlock,
                        toBlock
                    );
                }
            );
        } catch (err) {
            this.logger.error(
                `Scan failed: ${fromBlock} - ${toBlock}`,
                err.stack
            );
            throw err;
        }
    }
    async saveContractEvents(
        manager: EntityManager,
        logs: Log[],
    ) {
        if (!logs.length) return;

        const entities: ContractEventEntity[] = [];

        for (const log of logs) {
            const guid = this.web3.utils.keccak256(
                `${log.transactionHash.toLowerCase()}-${log.logIndex}`
            );

            entities.push(
                manager.create(ContractEventEntity, {
                    guid,
                    block_hash: log.blockHash,
                    contract_address: log.address.toLowerCase(),
                    transaction_hash: log.transactionHash,
                    log_index: log.logIndex,
                    event_signature: log.topics[0],
                    timestamp: 0, // 后续补 block.timestamp
                    rlp_bytes: JSON.stringify(log),
                })
            );
        }
        await manager
            .createQueryBuilder()
            .insert()
            .into(ContractEventEntity)
            .values(entities)
            .orIgnore()
            .execute();
    }

    async saveBlocksInRange(
        manager: EntityManager,
        fromBlock: number,
        toBlock: number,
    ) {
        const blocks: BlocksEntity[] = [];
        for (let i = fromBlock; i <= toBlock; i++) {
            const block = await this.web3.eth.getBlock(i);

            if (!block) {
                throw new Error(`Block ${i} not found`);
            }
            blocks.push(
                manager.create(BlocksEntity, {
                    number: block.number.toString(),
                    hash: Buffer.from(block.hash.slice(2), 'hex'),
                    parent_hash: Buffer.from(block.parentHash.slice(2), 'hex'),
                })
            );
        }
        await manager
            .createQueryBuilder()
            .insert()
            .into(BlocksEntity)
            .values(blocks)
            .orIgnore()
            .execute();
    }
}
