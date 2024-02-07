import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  PACKAGE_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import { NestjsPinoLoggerModule } from '@nestjs-mod/pino';
import { TerminusHealthCheckModule } from '@nestjs-mod/terminus';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { join } from 'path';
import { AppModule } from './app/app.module';

bootstrapNestApplication({
  modules: {
    system: [
      ProjectUtils.forRoot({
        staticConfiguration: {
          applicationPackageJsonFile: join(
            __dirname,
            '..',
            '..',
            '..',
            'apps/app-name',
            PACKAGE_JSON_FILE
          ),
          packageJsonFile: join(__dirname, '..', '..', '..', PACKAGE_JSON_FILE),
          envFile: join(__dirname, '..', '..', '..', '.env'),
        },
      }),
      DefaultNestApplicationInitializer.forRoot(),
      NestjsPinoLoggerModule.forRoot(),
      TerminusHealthCheckModule.forRootAsync({
        configurationFactory: (
          memoryHealthIndicator: MemoryHealthIndicator
        ) => ({
          standardHealthIndicators: [
            {
              name: 'memory_heap',
              check: () =>
                memoryHealthIndicator.checkHeap(
                  'memory_heap',
                  150 * 1024 * 1024
                ),
            },
          ],
        }),
        inject: [MemoryHealthIndicator],
      }),
      DefaultNestApplicationListener.forRoot({
        staticConfiguration: {
          // When running in infrastructure mode, the backend server does not start.
          mode: isInfrastructureMode() ? 'init' : 'listen',
        },
      }),
    ],
    feature: [AppModule.forRoot()],
    infrastructure: [
      InfrastructureMarkdownReportGenerator.forRoot({
        staticConfiguration: {
          markdownFile: join(
            __dirname,
            '..',
            '..',
            '..',
            'apps/app-name',
            'INFRASTRUCTURE.MD'
          ),
          skipEmptySettings: true,
        },
      }),
      Pm2.forRoot({
        configuration: {
          ecosystemConfigFile: join(
            __dirname,
            '..',
            '..',
            '..',
            ECOSYSTEM_CONFIG_FILE
          ),
          applicationScriptFile: join('dist/apps/app-name/main.js'),
        },
      }),
    ],
  },
});
