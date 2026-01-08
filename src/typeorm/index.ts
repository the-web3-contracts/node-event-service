import { AdminEntity } from './admin.entity';
import { AuthEntity } from './auth.entity';
import { RoleEntity } from './role.entity';
import { RoleAuthEntity } from './roleauth.entity';
import { SysLogEntity } from './syslog.entity';
import { BlocksEntity } from './blocks.entity';
import { ContractEventEntity } from './contractevents.entity';
import { EventBlockEntity } from './eventblocks.entity';
import {DepositEntity} from "./deposit.entity";
import {DepositUsdtEntity} from "./deposit_usdt.entity";
import {LiquidityAddedEntity} from "./liquidity_added.entity";
import {LiquidityProviderDepositsEntity} from "./liquidity_provider_deposits.entity";
import {LiquidityProviderRewardsEntity} from "./liquidity_provider_rewards.entity";
import {LpClaimRewardEntity} from "./lp_claim_reward.entity";
import {LpRoundStakingOverEntity} from "./lp_round_staking_over.entity";
import {OutOfAchieveReturnsNodeExitEntity} from "./out_of_achieve_returns_node_exit.entity";
import {TokensBurnedEntity} from "./tokens_burned.entity";
import {WithdrawEntity} from "./withdraw.entity";


const entities = [
    AdminEntity,
    AuthEntity,
    RoleEntity,
    RoleAuthEntity,
    SysLogEntity,
    BlocksEntity,
    ContractEventEntity,
    EventBlockEntity,
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
];

export {
    AdminEntity,
    AuthEntity,
    RoleEntity,
    RoleAuthEntity,
    SysLogEntity,
    BlocksEntity,
    ContractEventEntity,
    EventBlockEntity,
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
};

export default entities;
