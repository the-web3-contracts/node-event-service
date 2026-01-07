import {
    Column,
    Entity,
    PrimaryColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'role' })
@Index('idx_role_role_name', ['role_name'])
export class RoleEntity {
    @PrimaryColumn({ type: 'varchar', length: 32 })
    guid: string;
    // TEXT PRIMARY KEY DEFAULT replace(uuid_generate_v4()::text, '-', '')

    @Column({ type: 'varchar', length: 100, default: '' })
    role_name: string;
    // 角色名称

    @Column({ type: 'varchar', length: 255, default: '' })
    detail: string;
    // 角色描述 / 说明

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
