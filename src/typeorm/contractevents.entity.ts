import {
    Column,
    Entity,
    PrimaryColumn,
    Index,
} from 'typeorm';

@Entity({ name: 'contract_events' })
@Index('contract_events_timestamp', ['timestamp'])
@Index('contract_events_block_hash', ['block_hash'])
@Index('contract_events_event_signature', ['event_signature'])
@Index('contract_events_contract_address', ['contract_address'])
export class ContractEventEntity {
    @PrimaryColumn({ type: 'varchar' })
    guid: string;
    // 主键（外部生成）

    @Column({ type: 'varchar' })
    block_hash: string;
    // 区块 hash（外键 → block_headers.hash）

    @Column({ type: 'varchar' })
    contract_address: string;
    // 合约地址

    @Column({ type: 'varchar' })
    transaction_hash: string;
    // 交易 hash

    @Column({ type: 'int' })
    log_index: number;
    // log index（同 tx 内唯一）

    @Column({ type: 'varchar' })
    event_signature: string;
    // 事件签名（topic0）

    @Column({ type: 'int' })
    timestamp: number;
    // 区块时间戳（秒，> 0）

    @Column({ type: 'varchar' })
    rlp_bytes: string;
    // 原始 RLP / 编码数据
}
