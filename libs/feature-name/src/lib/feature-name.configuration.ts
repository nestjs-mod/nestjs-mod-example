import { ConfigModel, ConfigModelProperty } from '@nestjs-mod/common';

@ConfigModel()
export class FeatureNameConfiguration {
  @ConfigModelProperty({
    description: 'Config options name',
  })
  optionsName?: string;
}
