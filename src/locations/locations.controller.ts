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
  Header,
  StreamableFile,
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
import { LocationsService } from './locations.service';
import { ReadStream, createReadStream } from 'fs';
import { join } from 'path';

@Controller('locations')
@ApiTags('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

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
    return this.locationsService.createLocation(
      user,
      locationCreateDTO,
      image.filename,
    );
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
    return this.locationsService.guessLocation(user, locationGuessDTO, id);
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
    return this.locationsService.selectLocations(locationsFilterDTO);
  }

  @Get('/rand')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Location })
  @ApiOperation({
    summary: 'Select a random geolocation',
  })
  selectRandLocation(): Promise<Location> {
    return this.locationsService.selectRandLocation();
  }
  
  @Get('/image/:filename')
  @Header('Content-Type', 'image/png')
  @Public()
  @ApiBearerAuth()
  @ApiOkResponse({ type: StreamableFile })
  @ApiOperation({
    summary: 'Stream the subject users avatar',
  })
  streamImage(@Param('filename') filename: string): StreamableFile {
    try {
      const stream: ReadStream = createReadStream(
        join(process.cwd(), `uploads/${filename}`),
      );

      return new StreamableFile(stream);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/guesses')
  @ApiOkResponse({ type: [Guess] })
  @ApiOperation({
    summary: 'Select limited amount of geolocation guesses records',
  })
  selectGuesses(@Query() guessesFilterDTO: GuessesFilterDTO): Promise<Guess[]> {
    return this.locationsService.selectGuesses(guessesFilterDTO);
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
    return this.locationsService.selectPersonalGuesses(user, guessesFilterDTO);
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
    return this.locationsService.editLocation(
      user,
      id,
      locationEditDTO,
      image.filename,
    );
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
    return this.locationsService.removeLocation(user, id);
  }
}
