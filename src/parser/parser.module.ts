import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    WithdrawEntity
} from 'src/typeorm';
import { HttpModule } from '@nestjs/axios';
import {
    makeGaugeProvider,
} from "@willsoto/nestjs-prometheus";

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([
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
            WithdrawEntity
        ]),
    ],
    providers: [
        ParserService,
        makeGaugeProvider({
            name: 'event_stark_block',
            help: 'event stark block',
        }),
        makeGaugeProvider({
            name: 'event_end_block',
            help: 'event end block',
        }),
    ],
    exports: [ParserService],
})
export class ParserModule {}
