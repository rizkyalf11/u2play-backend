import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Post,
  //   Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { Response } from 'express';
import { diskStorage } from 'multer';
// import { ResponseSuccess } from 'src/utils/response';
import * as fs from 'fs';
import * as path from 'path';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadDto } from './upload.dot';
import { PrismaService } from 'src/prisma/prisma.service';
@Controller('upload')
export class UploadController extends BaseResponse {
  constructor(private prismaService: PrismaService) {
    super()
  }
  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        console.log(file);
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg|gif)$/))
          cb(null, true);
        else {
          cb(
            new HttpException(
              'unaccepted file extension or size',
              HttpStatus.UNPROCESSABLE_ENTITY,
            ),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          console.log('tersimpan');
          console.log('file => ', file);
          cb(
            null,
            // `${new Date().getTime()}.${file.originalname.split('.')[1]}`,
            `${new Date().getTime()}.${file.originalname.split('.').pop()}`,
          );
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        loc: {
          type: "string"
        }
      },
    },
  })
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    // @Res() res: Response,
    @Body() payload : UploadDto
  ): Promise<any> {
    try {
      console.log(payload);
      //   if (!file)
      //     return res.status(400).json({
      //       message: 'please enter an image',
      //     });
      const url = `http://localhost:${process.env.APP_PORT}/uploads/${file.filename}`;
      await this.prismaService.gallery.create({
        data: {
          url: url,
          loc: payload.loc
        }
      })
      return this._success('OK', {
        file_url: url,
        file_name: file.filename,
        file_size: file.size,
      });
    } catch (err) {
      console.log(err);
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('multi')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        console.log(file);
        if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg|gif)$/))
          cb(null, true);
        else {
          cb(
            new HttpException(
              'unaccepted file extension or size',
              HttpStatus.UNPROCESSABLE_ENTITY,
            ),
            false,
          );
        }
      },
      storage: diskStorage({
        destination: 'public/uploads',
        filename: (req, file, cb) => {
          const fileExtension = file.originalname.split('.').pop();
          cb(null, `${new Date().getTime()}.${fileExtension}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async uploadFileMulti(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<any> {
    try {
      const file_response: Array<{
        file_url: string;
        file_name: string;
        file_size: number;
      }> = [];

      files.forEach((file) => {
        const url = `http://localhost:${process.env.APP_PORT}/uploads/${file.filename}`;
        file_response.push({
          file_url: url,
          file_name: file.filename,
          file_size: file.size,
        });
      });

      return this._success('OK', {
        file: file_response,
      });
    } catch (err) {
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/delete/:filename')
  async deleteFile(@Param('filename') filename: string) {
    try {
      const filePath = `/public/uploads/${filename}`;
      // console.log(filePath);
      const pathName = path.join(__dirname, '../../..', filePath);
      // console.log(pathName);
      fs.unlinkSync(pathName);
      return this._success('Berhasil menghapus File');
    } catch (err) {
      throw new HttpException('File not Found', HttpStatus.NOT_FOUND);
    }
  }
}