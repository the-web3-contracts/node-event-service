import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'out_of_achieve_returns_node_exit' })
@Index('idx_out_of_achieve_returns_provider', ['liquidity_provider'])
export class OutOfAchieveReturnsNodeExitEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ length: 42 })
    liquidity_provider: string;

    @Column({ type: 'numeric' })
    team_reward: string;

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
