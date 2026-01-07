import { AdminEntity } from './admin.entity';
import { AuthEntity } from './auth.entity';
import { RoleEntity } from './role.entity';
import { RoleAuthEntity } from './roleauth.entity';
import { SysLogEntity } from './syslog.entity';
import { BlocksEntity } from './blocks.entity';
import { ContractEventEntity } from './contractevents.entity';
import { EventBlockEntity } from './eventblocks.entity';


const entities = [
    AdminEntity,
    AuthEntity,
    RoleEntity,
    RoleAuthEntity,
    SysLogEntity,
    BlocksEntity,
    ContractEventEntity,
    EventBlockEntity,
];

export {
    AdminEntity,
    AuthEntity,
    RoleEntity,
    RoleAuthEntity,
    SysLogEntity,
    BlocksEntity,
    ContractEventEntity,
    EventBlockEntity,
};

export default entities;
