import { Injectable } from '@nestjs/common';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';

@Injectable()
export class AuthService extends BaseResponse {
    login() {
        return this._success('success login')
    }
}
