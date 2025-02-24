import { typescript } from 'projen';
const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'catalogi-manager',
  projenrcTs: true,
  deps: [
    'dotenv',
    '@gemeentenijmegen/modules-zgw-client',
    'zod',
    'jsonwebtoken',
  ],
  devDeps: [
    '@types/jsonwebtoken',
  ],
  jestOptions: {
    jestConfig: {
      setupFiles: ['dotenv/config'],
    },
  },
  gitignore: ['.env'],
});
project.synth();