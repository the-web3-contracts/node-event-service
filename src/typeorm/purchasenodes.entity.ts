import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';


@Entity({ name: 'purchase_nodes' })
@Index('idx_purchase_nodes_buyer', ['buyer'])
@Index('uniq_purchase_nodes_tx_log', ['tx_hash', 'log_index'], { unique: true })
export class PurchaseNodesEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ length: 42 })
    buyer: string;

    @Column({ type: 'numeric' })
    amount: string;

    @Column({ type: 'smallint' })
    node_type: number;

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
