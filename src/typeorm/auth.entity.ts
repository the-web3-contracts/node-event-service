import {
    Column,
    Entity,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'auth' })
@Index('idx_auth_user_id', ['user_id'])
@Index('idx_auth_pid', ['pid'])
@Index('idx_auth_create_id', ['create_id'])
@Index('idx_auth_update_id', ['update_id'])
export class AuthEntity {
    @PrimaryColumn({ type: 'varchar', length: 32 })
    guid: string;
    // 对应：TEXT PRIMARY KEY DEFAULT replace(uuid_generate_v4()::text, '-', '')

    @Column({ type: 'varchar', length: 255, default: '' })
    auth_name: string;
    // 权限名称

    @Column({ type: 'varchar', length: 255, default: '' })
    auth_url: string;
    // 权限路径 / 接口地址

    @Column({ type: 'int', default: 0 })
    user_id: number;
    // 所属用户 / 管理员 ID

    @Column({ type: 'int', default: 0 })
    pid: number;
    // 父级权限 ID（用于权限树）

    @Column({ type: 'int', default: 0 })
    sort: number;
    // 排序

    @Column({ type: 'varchar', length: 255, default: '' })
    icon: string;
    // 图标

    @Column({ type: 'int', default: 1 })
    is_show: number;
    // 是否显示（1显示；0隐藏）

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
