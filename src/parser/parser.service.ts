import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    EventBlockEntity,
    ContractEventEntity,
    DepositEntity,
    DepositUsdtEntity,
    LiquidityAddedEntity,
    LiquidityProviderDepositsEntity,
    LiquidityProviderRewardsEntity,
    LpClaimRewardEntity,
    LpRoundStakingOverEntity,
    OutOfAchieveReturnsNodeExitEntity,
    TokensBurnedEntity,
    WithdrawEntity,
} from 'src/typeorm';
import fomoTreasureManagerAbi from '../abi/FomoTreasureManager.json';
import { EntityManager, getManager, Repository, Between } from 'typeorm';
import Web3 from 'web3';
import { Log } from "web3-core";
import { HttpService } from '@nestjs/axios';
import { Gauge } from "prom-client";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { utils } from 'ethers';



const EVENT_START_BLOCK = 1000;
const EVENT_SYNC_BLOCK_STEP = 500;


@Injectable()
export class ParserService {
    private readonly logger = new Logger(ParserService.name);
    entityManager: EntityManager;
    web3: Web3;
    fomoTreasureManagerContract: any;
    nodeManagerContract:any
    stakingManagerContract:any

    constructor(
        private configService: ConfigService,
        @InjectRepository(EventBlockEntity)
        private readonly eventBlocksRepository: Repository<EventBlockEntity>,

        @InjectRepository(ContractEventEntity)
        private readonly contractEventEntityRepository: Repository<ContractEventEntity>,

        @InjectRepository(DepositEntity)
        private readonly depositEntityRepository: Repository<DepositEntity>,

        @InjectRepository(DepositUsdtEntity)
        private readonly depositUsdtEntityRepository: Repository<DepositUsdtEntity>,

        @InjectRepository(LiquidityAddedEntity)
        private readonly liquidityAddedEntityRepository: Repository<LiquidityAddedEntity>,

        @InjectRepository(LiquidityProviderDepositsEntity)
        private readonly liquidityProviderDepositsEntityRepository: Repository<LiquidityProviderDepositsEntity>,

        @InjectRepository(LiquidityProviderRewardsEntity)
        private readonly liquidityProviderRewardsEntityRepository: Repository<LiquidityProviderRewardsEntity>,

        @InjectRepository(LpClaimRewardEntity)
        private readonly lpClaimRewardEntityRepository: Repository<LpClaimRewardEntity>,

        @InjectRepository(LpRoundStakingOverEntity)
        private readonly lpRoundStakingOverEntityRepository: Repository<LpRoundStakingOverEntity>,

        @InjectRepository(OutOfAchieveReturnsNodeExitEntity)
        private readonly outOfAchieveReturnsNodeExitEntityRepository: Repository<OutOfAchieveReturnsNodeExitEntity>,

        @InjectRepository(TokensBurnedEntity)
        private readonly tokensBurnedEntityRepository: Repository<TokensBurnedEntity>,

        @InjectRepository(OutOfAchieveReturnsNodeExitEntity)
        private readonly withdrawEntityRepository: Repository<WithdrawEntity>,

        @InjectMetric('event_stark_block')
        public metricEventStartBlock: Gauge<string>,

        @InjectMetric('event_end_block')
        public metricEventEndBlock: Gauge<string>,
    ) {
        this.entityManager = getManager();

        this.fomoTreasureManagerContract = new this.web3.eth.Contract(
            fomoTreasureManagerAbi as any,
            configService.get('FM_ADDRESS'),
        );
    }

    async getStartBlock(): Promise<bigint> {
        const lastBlock = await this.eventBlocksRepository
            .createQueryBuilder('b')
            .orderBy('b.number', 'DESC')
            .getOne();
        if (!lastBlock) {
            return BigInt(EVENT_START_BLOCK);
        }
        // @ts-ignore
        return BigInt(lastBlock.number) + 1n;
    }

    /*
    * 获取 event_block 数据库表的区块
    * - 若 event_block 表没有数据，使用配置的区块做起始块
    * - 若 event_block 表里面有数据，使用 event_block 里面的最新区块做为起始块
    * 去要扫块的步长，用起始块加上步长做为终止块，start=startBlock, end=startBlock+blockStep
    * 使用 startBlock 和 endBlock 做为查询范围，查询 contract_events 表里面的合约事件
    * 查到事件之后，按照合约 ABI 进行解析合约事件，然后将不同合约入到不同数据库表
    */
    async eventParser() {
        const startBlock = await this.getStartBlock();
        const blockStep = BigInt(EVENT_SYNC_BLOCK_STEP);
        const endBlock = startBlock + blockStep

        const logs = await this.contractEventEntityRepository.find({
            where: {
                block_number: Between(
                    startBlock.toString(),
                    endBlock.toString(),
                ),
            }
        });

        /*
        * 定一个各个合约 ABI, 加载 ABI 之后
        * 通过 ABI 解析合约事件，解析出来之后落库（解析是根据 event signature 来匹配）
        */
    }
}
