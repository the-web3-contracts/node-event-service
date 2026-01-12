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
    WithdrawEntity, BindInviterEntity,
} from 'src/typeorm';
import fomoTreasureManagerAbi from '../abi/FomoTreasureManager.json';
import nodeManagerAbi from '../abi/NodeManager.json';
import stakingManagerAbi from '../abi/StakingManager.json';
import { EntityManager, getManager, Repository, Between } from 'typeorm';
import Web3 from 'web3';
import { Log } from "web3-core";
import { HttpService } from '@nestjs/axios';
import { Gauge } from "prom-client";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { utils } from 'ethers';
import {PurchaseNodesEntity} from "../typeorm/purchasenodes.entity";
import {DistributeNodeRewardsEntity} from "../typeorm/distributenoderewards.entity";

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

        @InjectRepository(BindInviterEntity)
        private readonly bindInviterEntityRepository: Repository<BindInviterEntity>,

        @InjectRepository(PurchaseNodesEntity)
        private readonly purchaseNodesEntityRepository: Repository<PurchaseNodesEntity>,

        @InjectRepository(DistributeNodeRewardsEntity)
        private readonly distributeNodeRewardsEntityRepository: Repository<DistributeNodeRewardsEntity>,

        @InjectMetric('event_stark_block')
        public metricEventStartBlock: Gauge<string>,

        @InjectMetric('event_end_block')
        public metricEventEndBlock: Gauge<string>,
    ) {
        this.entityManager = getManager();

        const web3 = new Web3(
            new Web3.providers.HttpProvider(configService.get('RPC_URL')),
        );
        this.web3 = web3;

        this.fomoTreasureManagerContract = new this.web3.eth.Contract(
            fomoTreasureManagerAbi as any,
            configService.get('FM_ADDRESS'),
        );

        this.nodeManagerContract = new this.web3.eth.Contract(
            nodeManagerAbi as any,
            configService.get('NM_ADDRESS'),
        );

        this.stakingManagerContract = new this.web3.eth.Contract(
            stakingManagerAbi as any,
            configService.get('ST_ADDRESS'),
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
        await this.parseFomoTreasureManager(logs)
        await this.parseNodeManager(logs)
        await this.StakingManager(logs)
    }
    async parseNodeManager(logs:any) {
        const bindInviterRecords: BindInviterEntity[] = [];
        const outOfAchieveReturnsNodeExitRecords: OutOfAchieveReturnsNodeExitEntity[] = [];
        const purchaseNodesRecords: PurchaseNodesEntity [] = [];
        const distributeNodeRewardsRecords: DistributeNodeRewardsEntity [] = [];
        const liquidityAddedRecords: LiquidityAddedEntity [] = [];
        for (let i = 0; i < logs.length; i++) {
            // BindInviter
            this.nodeManagerContract.events.BindInviter().on(logs[i], (event) => {
                const record = new BindInviterEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.inviter = event.returnValues.inviter.toLowerCase();
                record.invitee = event.returnValues.invitee.toLowerCase();
                record.block_number = event.blockNumber.toString();
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                bindInviterRecords.push(record);
            }).on('error', console.error);

            // outOfAchieveReturnsNodeExit
            this.nodeManagerContract.events.outOfAchieveReturnsNodeExit().on(logs[i], (event) => {
                const record = new OutOfAchieveReturnsNodeExitEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.liquidity_provider = event.returnValues.recipient.toLowerCase();
                record.team_reward = event.returnValues.totalReward;
                record.block_number = event.blockNumber.toString();
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                outOfAchieveReturnsNodeExitRecords.push(record);
            }).on('error', console.error);

            // PurchaseNodesEntity
            this.nodeManagerContract.events.OutOfAchieveReturnsNodeExit().on(logs[i], (event) => {
                const record = new PurchaseNodesEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.buyer = event.returnValues.buyer.toLowerCase();
                record.amount = event.returnValues.amount;
                record.node_type = event.returnValues.node_type;
                record.block_number = event.blockNumber.toString();
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                purchaseNodesRecords.push(record);
            }).on('error', console.error);

            // DistributeNodeRewards
            this.nodeManagerContract.events.DistributeNodeRewards().on(logs[i], (event) => {
                const record = new DistributeNodeRewardsEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.recipient = event.returnValues.recipient.toLowerCase();
                record.amount = event.returnValues.amount;
                record.income_type = event.returnValues.income_type;
                record.block_number = event.blockNumber.toString();
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                distributeNodeRewardsRecords.push(record);
            }).on('error', console.error);

            // LiquidityAddedEntity
            this.nodeManagerContract.events.LiquidityAdded().on(logs[i], (event) => {
                const record = new LiquidityAddedEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.liquidity = event.returnValues.liquidity;
                record.amount0 = event.returnValues.amount0;
                record.amount1 = event.returnValues.amount1;
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                liquidityAddedRecords.push(record);
            }).on('error', console.error);
         }

        await this.bindInviterEntityRepository
            .createQueryBuilder()
            .insert()
            .into(BindInviterEntity)
            .values(bindInviterRecords)
            .orIgnore()
            .execute();

        await this.outOfAchieveReturnsNodeExitEntityRepository
            .createQueryBuilder()
            .insert()
            .into(OutOfAchieveReturnsNodeExitEntity)
            .values(outOfAchieveReturnsNodeExitRecords)
            .orIgnore()
            .execute();

        await this.purchaseNodesEntityRepository
            .createQueryBuilder()
            .insert()
            .into(PurchaseNodesEntity)
            .values(purchaseNodesRecords)
            .orIgnore()
            .execute();

        await this.distributeNodeRewardsEntityRepository
            .createQueryBuilder()
            .insert()
            .into(DistributeNodeRewardsEntity)
            .values(distributeNodeRewardsRecords)
            .orIgnore()
            .execute();

        await this.liquidityAddedEntityRepository
            .createQueryBuilder()
            .insert()
            .into(LiquidityAddedEntity)
            .values(liquidityAddedRecords)
            .orIgnore()
            .execute();
    }

    async StakingManager(logs:any) {
        const liquidityProviderDepositsRecords: LiquidityProviderDepositsEntity[] = [];
        const liquidityProviderRewardsRecords: LiquidityProviderRewardsEntity[] = [];
        const lpRoundStakingOverRecords: LpRoundStakingOverEntity [] = [];
        const lpClaimRewardRecords: LpClaimRewardEntity [] = [];
        const outOfAchieveReturnsNodeRecords: OutOfAchieveReturnsNodeExitEntity [] = [];
        const liquidityAddedNodeRecords: LiquidityAddedEntity [] = [];
        const tokensBurnedNodeRecords: TokensBurnedEntity [] = [];
        for (let i = 0; i < logs.length; i++) {
            // LiquidityProviderDeposits
            this.stakingManagerContract.events.LiquidityProviderDeposits().on(logs[i], (event) => {
                const record = new LiquidityProviderDepositsEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.token_address = event.returnValues.tokenAddress;
                record.staking_type = event.returnValues.stakingType;
                record.liquidity_provider = event.returnValues.liquidityProvider;
                record.amount = event.returnValues.amount;
                record.start_time = event.returnValues.startTime;
                record.end_time = event.returnValues.endTime;
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                liquidityProviderDepositsRecords.push(record);
            }).on('error', console.error);

            // LiquidityProviderRewards
            this.stakingManagerContract.events.LiquidityProviderRewards().on(logs[i], (event) => {
                const record = new LiquidityProviderRewardsEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.liquidity_provider = event.returnValues.liquidityProvider;
                record.amount = event.returnValues.amount;
                record.reward_block = event.returnValues.rewardBlock;
                record.income_type = event.returnValues.incomeType;
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                liquidityProviderRewardsRecords.push(record);
            }).on('error', console.error);


            // lpRoundStakingOver
            this.stakingManagerContract.events.LpRoundStakingOver().on(logs[i], (event) => {
                const record = new LpRoundStakingOverEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.liquidity_provider = event.returnValues.liquidityProvider;
                record.end_block = event.returnValues.endBlock;
                record.end_time = event.returnValues.endTime;
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                lpRoundStakingOverRecords.push(record);
            }).on('error', console.error);

            // lpClaimReward
            this.stakingManagerContract.events.LpClaimReward().on(logs[i], (event) => {
                const record = new LpClaimRewardEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.liquidity_provider = event.returnValues.liquidityProvider;
                record.withdraw_amount = event.returnValues.withdrawAmount;
                record.to_prediction_amount = event.returnValues.toPredictionAmount;
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                lpClaimRewardRecords.push(record);
            }).on('error', console.error);
            // outOfAchieveReturnsNodeExit
            this.stakingManagerContract.events.OutOfAchieveReturnsNodeExit().on(logs[i], (event) => {
                const record = new OutOfAchieveReturnsNodeExitEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.liquidity_provider = event.returnValues.liquidityProvider;
                record.team_reward = event.returnValues.totalReward;
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                outOfAchieveReturnsNodeRecords.push(record);
            }).on('error', console.error);

            // LiquidityAdded
            this.stakingManagerContract.events.LiquidityAdded().on(logs[i], (event) => {
                const record = new LiquidityAddedEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.liquidity = event.returnValues.liquidity;
                record.amount0 = event.returnValues.amount0;
                record.amount1 = event.returnValues.amount1;
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                liquidityAddedNodeRecords.push(record);
            }).on('error', console.error);

            // TokensBurned
            this.stakingManagerContract.events.TokensBurned().on(logs[i], (event) => {
                const record = new TokensBurnedEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.usdt_amount = event.returnValues.usdtAmount;
                record.tokens_burned = event.returnValues.tokensBurned;
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                tokensBurnedNodeRecords.push(record);
            }).on('error', console.error);
        }
        await this.liquidityProviderDepositsEntityRepository
            .createQueryBuilder()
            .insert()
            .into(LiquidityProviderDepositsEntity)
            .values(liquidityProviderDepositsRecords)
            .orIgnore()
            .execute();

        await this.liquidityProviderRewardsEntityRepository
            .createQueryBuilder()
            .insert()
            .into(LiquidityProviderRewardsEntity)
            .values(liquidityProviderRewardsRecords)
            .orIgnore()
            .execute();

        await this.lpRoundStakingOverEntityRepository
            .createQueryBuilder()
            .insert()
            .into(LpRoundStakingOverEntity)
            .values(lpRoundStakingOverRecords)
            .orIgnore()
            .execute();

        await this.lpClaimRewardEntityRepository
            .createQueryBuilder()
            .insert()
            .into(LpClaimRewardEntity)
            .values(lpClaimRewardRecords)
            .orIgnore()
            .execute();

        await this.outOfAchieveReturnsNodeExitEntityRepository
            .createQueryBuilder()
            .insert()
            .into(OutOfAchieveReturnsNodeExitEntity)
            .values(outOfAchieveReturnsNodeRecords)
            .orIgnore()
            .execute();

        await this.liquidityAddedEntityRepository
            .createQueryBuilder()
            .insert()
            .into(LiquidityAddedEntity)
            .values(liquidityAddedNodeRecords)
            .orIgnore()
            .execute();

        await this.tokensBurnedEntityRepository
            .createQueryBuilder()
            .insert()
            .into(TokensBurnedEntity)
            .values(tokensBurnedNodeRecords)
            .orIgnore()
            .execute();
    }

    async parseFomoTreasureManager(logs:any) {
        const depositRecords: DepositEntity[] = [];
        const withdrawRecords: WithdrawEntity[] = [];
        for (let i = 0; i < logs.length; i++) {
            // Deposit
            this.fomoTreasureManagerContract.events.Deposit().on(logs[i], (event) => {
                const record = new DepositEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.token_address = event.returnValues.tokenAddress.toLowerCase();
                record.sender = event.returnValues.sender.toLowerCase();
                record.amount = event.returnValues.amount;
                record.block_number = event.blockNumber.toString();
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                depositRecords.push(record);
            }).on('error', console.error);

            // Withdraw
            this.fomoTreasureManagerContract.events.Withdraw().on(logs[i], (event) => {
                const record = new WithdrawEntity();
                record.guid = `${event.transactionHash}_${event.logIndex}`;
                record.token_address = event.returnValues.tokenAddress.toLowerCase();
                record.sender = event.returnValues.sender.toLowerCase();
                record.withdraw_address = event.returnValues.withdrawAddress.toLowerCase();
                record.amount = event.returnValues.amount;
                record.block_number = event.blockNumber.toString();
                record.tx_hash = event.transactionHash;
                record.log_index = event.logIndex;
                withdrawRecords.push(record);
            }).on('error', console.error);
        }

        await this.depositEntityRepository
            .createQueryBuilder()
            .insert()
            .into(DepositEntity)
            .values(depositRecords)
            .orIgnore()
            .execute();

        await this.withdrawEntityRepository
            .createQueryBuilder()
            .insert()
            .into(WithdrawEntity)
            .values(withdrawRecords)
            .orIgnore()
            .execute();
    }
}
