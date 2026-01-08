import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'withdraw' })
@Index('idx_withdraw_token', ['token_address'])
export class WithdrawEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ length: 42 })
    token_address: string;

    @Column({ length: 42 })
    sender: string;

    @Column({ length: 42 })
    withdraw_address: string;

    @Column({ type: 'numeric' })
    amount: string;

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
