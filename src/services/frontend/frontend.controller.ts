import { FrontendService } from './frontend.service';
import { Controller, Get, Post, Body, Query } from '@nestjs/common';

@Controller('/api/v1')
export class FrontendController {
    constructor(private readonly frontendService: FrontendService) {}

    @Post('getDepositTokenList')
    async getDepositTokenList(@Body() param) {
        const address_num = param['address_num'];
        const depositTokenList = await this.frontendService.getDepositTokenList();
        return {
            code: 2000,
            msg: 'xxxxx',
            depositTokenList: depositTokenList,
        };
    }

    @Post('getDepositTokenDetail')
    async getDepositTokenDetail(@Body() param) {
        const address = param['address'];
        const params = {
            guid: "address",
        };
        const dtDetail = await this.frontendService.getDepositTokenDetail(params);
        return {
            code: 4000,
            msg: 'xxxxx',
            data: dtDetail
        };
    }

    @Get('testApi')
    async testApi() {
        const ok = await this.frontendService.testApi();
        if (ok ){
            return {
                code: 2000,
                msg: 'test api success',
                test: "successes"
            };
        } else {
            return {
                code: 2000,
                msg: 'test api fail',
                test: "fail"
            };
        }
    }
}
