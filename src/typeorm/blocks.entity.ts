import {
    Column,
    Entity,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'blocks' })
@Index('idx_blocks_number', ['number'], { unique: true })
@Index('idx_blocks_hash', ['hash'], { unique: true })
export class BlocksEntity {
    @PrimaryColumn({ type: 'bigint' })
    number: string;
    // 区块高度（BIGINT → string，防止 JS 精度问题）

    @Column({ type: 'bytea' })
    hash: Buffer;
    // 区块 hash

    @Column({ type: 'bytea' })
    parent_hash: Buffer;
    // 父区块 hash

    @CreateDateColumn({
        type: 'timestamp',
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
    // 入库时间

    @UpdateDateColumn({
        type: 'timestamp',
        name: 'updated_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;
    // 更新时间
}
