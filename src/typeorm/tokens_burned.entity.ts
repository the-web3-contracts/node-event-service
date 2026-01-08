import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tokens_burned' })
export class TokensBurnedEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ type: 'numeric' })
    usdt_amount: string;

    @Column({ type: 'numeric' })
    tokens_burned: string;

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
