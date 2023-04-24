import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const PUBLIC = 'Public';

export const Public: () => CustomDecorator<string> = () =>
  SetMetadata(PUBLIC, true);
