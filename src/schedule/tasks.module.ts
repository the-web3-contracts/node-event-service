import { CacheModule, Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { SynchronizerModule } from '../synchronizer/synchronizer.module';


@Module({
    imports: [
        CacheModule.register(),
        SynchronizerModule,
    ],
    providers: [TasksService],
})
export class TasksModule {}
