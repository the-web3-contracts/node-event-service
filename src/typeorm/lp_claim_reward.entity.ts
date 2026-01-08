import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'lp_claim_reward' })
@Index('idx_lp_claim_reward_provider', ['liquidity_provider'])
export class LpClaimRewardEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ length: 42 })
    liquidity_provider: string;

    @Column({ type: 'numeric' })
    withdraw_amount: string;

    @Column({ type: 'numeric' })
    to_prediction_amount: string;

    @Column({ type: 'smallint' })
    lp_type: number;

    @Column({ type: 'numeric' })
    block_number: string;

    @Column({ unique: true })
    tx_hash: string;

    @Column({ default: 0 })
    log_index: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
