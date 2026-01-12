import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'distribute_node_rewards' })
@Index('idx_dnr_recipient', ['recipient'])
@Index('uniq_dnr_tx_log', ['tx_hash', 'log_index'], { unique: true })
export class DistributeNodeRewardsEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ length: 42 })
    recipient: string;

    @Column({ type: 'numeric' })
    amount: string;

    @Column({ type: 'smallint' })
    income_type: number;

    @Column({ type: 'numeric' })
    block_number: string;

    @Column()
    tx_hash: string;

    @Column({ default: 0 })
    log_index: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
