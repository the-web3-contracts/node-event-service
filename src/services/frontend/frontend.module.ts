import { Module } from '@nestjs/common';
import { FrontendService } from './frontend.service';
import { FrontendController } from './frontend.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BlocksEntity } from 'src/typeorm';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([BlocksEntity])],
    controllers: [FrontendController],
    providers: [FrontendService],
    exports: [FrontendService],
})
export class FrontendModule {}
