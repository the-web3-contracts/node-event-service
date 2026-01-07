import { Module } from '@nestjs/common';
import { SynchronizerService } from './synchronizer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksEntity, ContractEventEntity } from 'src/typeorm';
import { HttpModule } from '@nestjs/axios';
import {
    makeGaugeProvider,
} from "@willsoto/nestjs-prometheus";

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([BlocksEntity, ContractEventEntity]),
    ],
    providers: [
        SynchronizerService,
        makeGaugeProvider({
            name: 'stark_block',
            help: 'stark block',
        }),
        makeGaugeProvider({
            name: 'end_block',
            help: 'end block',
        }),
    ],
    exports: [SynchronizerService],
})
export class SynchronizerModule {}
