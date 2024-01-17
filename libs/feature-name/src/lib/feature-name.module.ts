import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { FeatureNameConfiguration } from './feature-name.configuration';
import { FeatureNameEnvironments } from './feature-name.environments';

export const { FeatureNameModule } = createNestModule({
  moduleName: 'FeatureNameModule',
  moduleCategory: NestModuleCategory.feature,
  configurationModel: FeatureNameConfiguration,
  environmentsModel: FeatureNameEnvironments,
  controllers: [],
  sharedProviders: [],
});
