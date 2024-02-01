import {
  DefaultNestApplicationInitializer,
  DefaultNestApplicationListener,
  InfrastructureMarkdownReportGenerator,
  PACKAGE_JSON_FILE,
  ProjectUtils,
  bootstrapNestApplication,
  isInfrastructureMode,
} from '@nestjs-mod/common';
import { NestjsPinoLogger } from '@nestjs-mod/pino';
import { TerminusHealthCheck } from '@nestjs-mod/terminus';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { ECOSYSTEM_CONFIG_FILE, Pm2 } from '@nestjs-mod/pm2';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app/app.module';

const globalPrefix = 'api';

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
      NestjsPinoLogger.forRoot(),
      TerminusHealthCheck.forRootAsync({
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
          preListen: async ({ app }) => {
            if (app) {
              app.setGlobalPrefix(globalPrefix);
            }
          },
          postListen: async ({ current }) => {
            if (isInfrastructureMode()) {
              /**
               * When you start the application in infrastructure mode, it should automatically close;
               * if for some reason it does not close, we forcefully close it after 30 seconds.
               */
              setTimeout(() => process.exit(0), 30000);
            }
            Logger.log(
              `🚀 Application is running on: http://${
                current.staticEnvironments?.hostname ?? 'localhost'
              }:${current.staticEnvironments?.port}/${globalPrefix}`
            );
          },
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
