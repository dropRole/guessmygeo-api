import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { Action } from 'src/actions/action.entity';
import { User } from 'src/auth/user.entity';
import { Guess } from 'src/locations/guess.entity';
import { Location } from 'src/locations/location.entity';

type LogInstance = Action | User | Location | Guess;

@Injectable({ scope: Scope.TRANSIENT })
export class UtilityLoggerService extends ConsoleLogger {
  instanceCreationLog(instance: LogInstance): void {
    this.log(
      `DataLog | ${instance.constructor.name} instance ${
        'username' in instance ? instance.username : instance.id
      } was created`,
    );
  }

  instanceSelectionLog(type: string, amount: number): void {
    this.log(`DataLog | ${amount} ${type} instance/s was/were read`);
  }

  instanceUpdateLog(instance: LogInstance): void {
    this.log(
      `DataLog | ${instance.constructor.name} instance ${
        'username' in instance ? instance.username : instance.id
      } was updated`,
    );
  }

  instanceDeletionLog(type: string, amount: number): void {
    this.log(`DataLog | ${amount} ${type} instance/s was/were deleted`);
  }
}
