import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'lp_round_staking_over' })
@Index('idx_lp_round_staking_over_provider', ['liquidity_provider'])
export class LpRoundStakingOverEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ length: 42 })
    liquidity_provider: string;

    @Column({ type: 'numeric' })
    end_block: string;

    @Column({ type: 'numeric' })
    end_time: string;

    @Column({ type: 'numeric' })
    block_number: string;

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
