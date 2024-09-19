import { createNestModule, NestModuleCategory } from '@nestjs-mod/common';
import { FeatureNameConfiguration } from './feature-name.configuration';
import { FeatureNameEnvironments } from './feature-name.environments';
import { FEATURE_NAME_MODULE } from './feature-name.constants';

export const { FeatureNameModule } = createNestModule({
  moduleName: FEATURE_NAME_MODULE,
  moduleCategory: NestModuleCategory.feature,
  configurationModel: FeatureNameConfiguration,
  environmentsModel: FeatureNameEnvironments,
  controllers: [],
  sharedProviders: [],
});
