import { CacheModule, Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { SynchronizerModule } from '../synchronizer/synchronizer.module';
import { ParserModule } from '../parser/parser.module';


@Module({
    imports: [
        CacheModule.register(),
        SynchronizerModule,
        ParserModule,
    ],
    providers: [TasksService],
})
export class TasksModule {}
