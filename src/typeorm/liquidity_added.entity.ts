import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'liquidity_added' })
@Index('idx_liquidity_added_token', ['token_id'])
export class LiquidityAddedEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ type: 'numeric' })
    token_id: string;

    @Column({ type: 'numeric' })
    liquidity: string;

    @Column({ type: 'numeric' })
    amount0: string;

    @Column({ type: 'numeric' })
    amount1: string;

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
