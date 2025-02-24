export default {
  '**/*.(ts)': (filenames) => [
    'yarn build',
    'yarn test',
    `yarn eslint --fix ${filenames.join(' ')}`,
    `yarn prettier --write ${filenames.join(' ')}`
  ]
};
