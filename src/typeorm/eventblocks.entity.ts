import {
    Column,
    Entity,
    PrimaryColumn,
    Index,
} from 'typeorm';

@Entity({ name: 'event_blocks' })
@Index('event_blocks_timestamp', ['timestamp'])
@Index('event_blocks_number', ['number'])
export class EventBlockEntity {
    @PrimaryColumn({ type: 'varchar' })
    guid: string;
    // 主键，由业务生成

    @Column({ type: 'varchar', unique: true })
    hash: string;
    // 区块 hash（唯一）

    @Column({ type: 'varchar', unique: true })
    parent_hash: string;
    // 父区块 hash（唯一）

    @Column({ type: 'varchar', unique: true })
    number: string;
    // 区块高度（UINT256 → string，避免精度丢失）

    @Column({ type: 'int', unique: true })
    timestamp: number;
    // 区块时间戳（秒，>0）
}
