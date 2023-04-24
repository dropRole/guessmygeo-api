import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Header,
  StreamableFile,
  Patch,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { Public } from './public.decorator';
import { UserRegisterDTO } from './dto/user-register.dto';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiBody,
  OmitType,
  ApiConsumes,
} from '@nestjs/swagger';
import { ReadStream, createReadStream } from 'fs';
import { join } from 'path';
import { InfoEditDTO } from './dto/info-edit.dto';
import { PassChangeDTO } from './dto/pass-change.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AvatarUploadDTO } from './dto/avatar-upload.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  @Post('/register')
  @Public()
  @ApiOkResponse({ type: undefined })
  @ApiOperation({ summary: 'Register a user record' })
  register(@Body() userRegisterDTO: UserRegisterDTO): Promise<void> {
    return;
  }

  @Post('/login')
  @Public()
  @ApiOkResponse({ type: Object })
  @ApiOperation({ summary: 'Log in the user and pass the auth token' })
  login(
    @Body() authCredentialsDTO: AuthCredentialsDTO,
  ): Promise<{ jwt: string }> {
    return;
  }

  @Get('/users')
  @ApiBearerAuth()
  @ApiOkResponse({ type: [User] })
  @ApiOperation({
    summary: 'Select users according to the provided search string',
  })
  selectUsers(@Query('search') search: string): Promise<User[]> {
    return;
  }

  @Get('/me/info')
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @ApiOperation({
    summary: 'Select basic info of the subject user',
  })
  selectInfo(@GetUser() user: User): User {
    return user;
  }

  @Get('/me/avatar')
  @Header('Content-Type', 'image/png')
  @ApiBearerAuth()
  @ApiOkResponse({ type: StreamableFile })
  @ApiOperation({
    summary: 'Stream the subject users avatar',
  })
  streamAvatar(@Query('avatar') avatar: string): StreamableFile {
    try {
      const stream: ReadStream = createReadStream(
        join(process.cwd(), `uploads/${avatar}`),
      );

      return new StreamableFile(stream);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch('/me/info')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  @ApiBody({ type: OmitType(UserRegisterDTO, ['pass' as const]) })
  @ApiOperation({
    summary: 'Edit the users basic info and pass the auth token',
  })
  editInfo(
    @GetUser() user: User,
    @Body() infoEditDTO: InfoEditDTO,
  ): Promise<{ jwt: string }> {
    return;
  }

  @Patch('/me/pass')
  @ApiBearerAuth()
  @ApiOkResponse({ type: undefined })
  @ApiOperation({
    summary: 'Change the subject users password',
  })
  changePass(
    @GetUser() user: User,
    @Body() passChangeDTO: PassChangeDTO,
  ): Promise<void> {
    return;
  }

  @Patch('/me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 15000 },
      fileFilter: (req, file, callback) => {
        // not of image/png MIME type
        if (file.mimetype !== 'image/png')
          return callback(
            new InternalServerErrorException(
              'File is not of image/png MIME type.',
            ),
            false,
          );

        return callback(null, true);
      },
      storage: diskStorage({
        destination: './uploads',
        filename(_req, file, callback) {
          callback(null, `${new Date().getTime()}_${file.originalname}`);
        },
      }),
    }),
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: Object })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AvatarUploadDTO, description: 'Uploaded user avatar' })
  @ApiOperation({
    summary: 'Upload an avatar BLOB',
  })
  uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 15000 }),
          new FileTypeValidator({ fileType: 'image/png' }),
        ],
      }),
    )
    avatar: Express.Multer.File,
    @GetUser() user: User,
  ): Promise<{ filename: string }> {
    return;
  }

  @Delete('/me/avatar')
  @ApiBearerAuth()
  @ApiOkResponse({ type: undefined })
  @ApiOperation({
    summary: 'Remove the users avatar from the server',
  })
  removeAvatar(@GetUser() user: User): Promise<void> {
    return;
  }
}
