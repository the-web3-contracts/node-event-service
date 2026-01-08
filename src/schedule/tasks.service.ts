import { Injectable, Logger, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Interval, SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { SynchronizerService} from '../synchronizer/synchronizer.service';
import {ParserService} from "../parser/parser.service";
const SYNC_STEP = 10;

const DEPOSIT_TOKEN_EVENT_START = 'deposit_token_start_block_number';
const WITHDRAW_UPDATE_EVENT_START = 'withdraw_update_start_block_number';


@Injectable()
export class TasksService {
    constructor(
        private configService: ConfigService,
        private readonly synchronizerService: SynchronizerService,
        private readonly parserService: ParserService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private schedulerRegistry: SchedulerRegistry,
    ) {
        this.initCache();
    }
    private readonly logger = new Logger(TasksService.name);

    async initCache() {
        let deposit_start_block_number = await this.cacheManager.get(DEPOSIT_TOKEN_EVENT_START);
        let withdraw_start_block_number = await this.cacheManager.get(WITHDRAW_UPDATE_EVENT_START);
        await this.cacheManager.set(DEPOSIT_TOKEN_EVENT_START, Number(deposit_start_block_number), {ttl: 0});
        await this.cacheManager.set(WITHDRAW_UPDATE_EVENT_START, Number(withdraw_start_block_number), {ttl: 0});
    }

    // @Interval(2000)
    // async event_scanner() {
    //     await this.synchronizerService.eventScanner();
    // }

    @Interval(2000)
    async event_parser() {
        await this.parserService.eventParser();
    }

    // @Interval(2000)
    // async contract_caller() {
    //     console.log("========================");
    //     console.log("====contract_caller======");
    //     console.log("========================");
    // }
    //
    // @Interval(2000)
    // async stat_worker() {
    //     console.log("========================");
    //     console.log("=====stat_worker=======");
    //     console.log("========================");
    // }
}
