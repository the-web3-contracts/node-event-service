import {
    Column,
    Entity,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'admin' })
@Index('idx_admin_status', ['status'])
@Index('idx_admin_create_id', ['create_id'])
@Index('idx_admin_update_id', ['update_id'])
@Index('idx_admin_last_login', ['last_login'])
export class AdminEntity {
    @PrimaryColumn({ type: 'varchar', length: 32 })
    guid: string;
    // TEXT PRIMARY KEY DEFAULT replace(uuid_generate_v4()::text, '-', '')

    @Column({ type: 'varchar', length: 32, unique: true })
    login_name: string;
    // 登录名（唯一）

    @Column({ type: 'varchar', length: 32, unique: true, nullable: true })
    real_name?: string;
    // 真实姓名（可空，唯一）

    @Column({ type: 'varchar', length: 100 })
    password: string;
    // 密码（加密后）

    @Column({ type: 'varchar', length: 255, default: '' })
    role_ids: string;
    // 角色 ID 列表（JSON / CSV）

    @Column({ type: 'varchar', length: 11, unique: true, nullable: true })
    phone?: string;
    // 手机号

    @Column({ type: 'varchar', length: 32, nullable: true })
    email?: string;
    // 邮箱

    @Column({ type: 'varchar', length: 255, default: '' })
    salt: string;
    // 密码盐

    @Column({ type: 'int', default: 0 })
    last_login: number;
    // 最后登录时间戳（秒）

    @Column({ type: 'varchar', length: 255, default: '' })
    last_ip: string;
    // 最后登录 IP

    @Column({ type: 'int', default: 1 })
    status: number;
    // 状态（1启用；0禁用）

    @Column({ type: 'int', default: 0 })
    create_id: number;
    // 创建人 ID

    @Column({ type: 'int', default: 0 })
    update_id: number;
    // 修改人 ID

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at: Date;
}
