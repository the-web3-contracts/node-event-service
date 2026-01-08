import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'liquidity_provider_rewards' })
@Index('idx_liquidity_provider_rewards_provider', ['liquidity_provider'])
export class LiquidityProviderRewardsEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ length: 42 })
    liquidity_provider: string;

    @Column({ type: 'numeric', unique: true })
    amount: string;

    @Column({ type: 'numeric' })
    reward_block: string;

    @Column({ type: 'smallint' })
    income_type: number;

    @Column({ type: 'numeric' })
    block_number: string;

    @Column({ unique: true })
    tx_hash: string;

    @Column({ type: 'smallint' })
    lp_type: number;

    @Column({ default: 0 })
    log_index: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
