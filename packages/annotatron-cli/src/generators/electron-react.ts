 export const electronReact = (name: string): void => {
  const repo = 'https://github.com/electron-react-boilerplate/electron-react-boilerplate.git';
  const command =  [
    `git clone --depth 1 --branch main ${repo} ${name}`
    `cd ${name}`,
    'rm -rf .git',
    'npm i',
  ].join (' && ');

  console.log(command);
};
