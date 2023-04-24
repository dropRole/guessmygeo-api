import {
  Controller,
  Post,
  UseInterceptors,
  Body,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Param,
  Get,
  Query,
  Patch,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  OmitType,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { LocationCreateDTO } from './dto/location-create.dto';
import { LocationGuessDTO } from './dto/location-guess.dto';
import { Public } from 'src/auth/public.decorator';
import { LocationsFilterDTO } from './dto/locations-filter.dto';
import { LocationEditDTO } from './dto/location-edit.dto';
import { Location } from './location.entity';
import { Guess } from './guess.entity';
import { GuessesFilterDTO } from './dto/guesses-filter.dto';

@Controller('locations')
@ApiTags('locations')
export class LocationsController {
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, callback) => {
        // not of image/png MIME type
        if (file.mimetype !== 'image/jpeg')
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
  @ApiOkResponse({ type: undefined })
  @ApiOperation({
    summary:
      'Create a record of the geolocation where the user image was taken',
  })
  @ApiConsumes('multipart/form-data')
  createLocation(
    @GetUser() user: User,
    @Body() locationCreateDTO: LocationCreateDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image/jpeg' })],
      }),
    )
    image: Express.Multer.File,
  ): Promise<void> {
    return;
  }

  @Post('/guess/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: undefined })
  @ApiOperation({
    summary: 'Create a record of the user guessing of the geolocation',
  })
  @ApiBody({ type: OmitType(LocationCreateDTO, ['caption', 'image'] as const) })
  guessLocation(
    @GetUser() user: User,
    @Body() locationGuessDTO: LocationGuessDTO,
    @Param('id') id: string,
  ): Promise<void> {
    return;
  }

  @Get()
  @Public()
  @ApiOkResponse({ type: [Location] })
  @ApiOperation({
    summary:
      'Select limited amount of geolocation records of the optionally desingated user',
  })
  selectLocations(
    @Query() locationsFilterDTO: LocationsFilterDTO,
  ): Promise<Location[]> {
    return;
  }

  @Get('/rand')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Location })
  @ApiOperation({
    summary: 'Select a random geolocation',
  })
  selectRandLocation(): Promise<Location> {
    return;
  }

  @Get('/guesses')
  @ApiOkResponse({ type: [Guess] })
  @ApiOperation({
    summary: 'Select limited amount of geolocation guesses records',
  })
  selectGuesses(@Query() guessesFilterDTO: GuessesFilterDTO): Promise<Guess[]> {
    return;
  }

  @Get('/guesses/me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: [Guess] })
  @ApiOperation({
    summary:
      'Select personal location guesses according to the passed results criteria',
  })
  selectPersonalGuesses(
    @GetUser() user: User,
    @Query() guessesFilterDTO: GuessesFilterDTO,
  ): Promise<Guess[]> {
    return;
  }

  @Patch('/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, callback) => {
        // not of image/png MIME type
        if (file.mimetype !== 'image/jpeg')
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
  @ApiOkResponse({ type: undefined })
  @ApiOperation({
    summary: 'Re-upload the geolocation image or edit its caption',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: LocationEditDTO,
    description: 'Uploaded image and caption of it',
  })
  editLocation(
    @GetUser() user: User,
    @Body() locationEditDTO: LocationEditDTO,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'image/jpeg' })],
      }),
    )
    image: Express.Multer.File,
  ): Promise<void> {
    return;
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: undefined })
  @ApiOperation({
    summary: 'Remove the location record and an image BLOB from the server',
  })
  removeLocation(
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    return;
  }
}
