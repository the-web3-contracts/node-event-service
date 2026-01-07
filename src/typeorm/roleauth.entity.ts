import {
    Column,
    Entity,
    PrimaryColumn,
    Index,
} from 'typeorm';

@Entity({ name: 'role_auth' })
@Index('idx_role_auth_role_id', ['role_id'])
export class RoleAuthEntity {
    @PrimaryColumn({ type: 'int' })
    auth_id: number;

    @PrimaryColumn({ type: 'bigint' })
    role_id: string;
}
