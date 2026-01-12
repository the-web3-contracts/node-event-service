import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'bind_inviter' })
@Index('idx_bind_inviter_inviter', ['inviter'])
@Index('idx_bind_inviter_invitee', ['invitee'])
@Index('uniq_bind_inviter_tx_log', ['tx_hash', 'log_index'], { unique: true })
export class BindInviterEntity {
    @PrimaryColumn()
    guid: string;

    @Column({ length: 42 })
    inviter: string;

    @Column({ length: 42 })
    invitee: string;

    @Column({ type: 'numeric' })
    block_number: string;

    @Column({ unique: false })
    tx_hash: string;

    @Column({ default: 0 })
    log_index: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
