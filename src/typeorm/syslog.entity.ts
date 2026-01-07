import {
    Column,
    Entity,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'sys_log' })
@Index('idx_syslog_cate', ['cate'])
@Index('idx_syslog_status', ['status'])
@Index('idx_syslog_order_number', ['order_number'])
export class SysLogEntity {
    @PrimaryColumn({ type: 'varchar', length: 32 })
    guid: string;
    // 对应：TEXT PRIMARY KEY DEFAULT replace(uuid_generate_v4()::text, '-', '')

    @Column({ type: 'varchar', length: 100, default: '' })
    action: string;

    @Column({ type: 'varchar', length: 100, default: '' })
    remark: string;

    @Column({ type: 'varchar', length: 30, default: '' })
    admin: string;

    @Column({ type: 'varchar', length: 30, default: '' })
    ip: string;

    @Column({ type: 'smallint', default: 0 })
    cate: number;
    // 类型(0其他;1登录;2财务操作)

    @Column({ type: 'smallint', default: -1 })
    status: number;
    // 登录状态(0成功;1失败)

    @Column({ type: 'varchar', length: 255, default: '' })
    asset: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    before: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    after: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    user_guid: string;

    @Column({ type: 'varchar', length: 64, default: '' })
    order_number: string;

    @Column({ type: 'smallint', default: -1 })
    op: number;
    // 操作类型(0添加;1编辑)

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;
}
