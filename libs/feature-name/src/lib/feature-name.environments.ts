import { EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class FeatureNameEnvironments {
  @EnvModelProperty({
    description: 'Environment name',
  })
  envName?: string;
}
