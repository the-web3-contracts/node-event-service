import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'liquidity_provider_deposits' })
@Index('idx_liquidity_provider_deposits_token', ['token_address'])
@Index('idx_liquidity_provider_deposits_provider', ['liquidity_provider'])
export class LiquidityProviderDepositsEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ length: 42 })
    token_address: string;

    @Column({ length: 42 })
    liquidity_provider: string;

    @Column({ type: 'numeric' })
    amount: string;

    @Column({ type: 'bigint' })
    start_time: string;

    @Column({ type: 'bigint' })
    end_time: string;

    @Column({ type: 'numeric' })
    block_number: string;

    @Column({ type: 'smallint', nullable: true })
    staking_type: number;

    @Column({ type: 'smallint' })
    lp_type: number;

    @Column({ unique: true })
    tx_hash: string;

    @Column({ default: 0 })
    log_index: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
