import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from './typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { StatusMonitorModule } from 'nest-status-monitor';
import statusMonitorConfig from './config/statusMonitor';
import { TasksModule } from './schedule/tasks.module'
import { FrontendModule } from './services/frontend/frontend.module'
import { SynchronizerModule } from './synchronizer/synchronizer.module'
import { ParserModule } from './parser/parser.module'

@Module({
    imports: [
        StatusMonitorModule.setUp(statusMonitorConfig),
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: +configService.get<number>('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_NAME'),
                entities: entities,
                synchronize: false,
                logging: ['error'],
            }),
            inject: [ConfigService],
        }),
        ScheduleModule.forRoot(),
        TasksModule,
        FrontendModule,
        SynchronizerModule,
        ParserModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
