 export const electronForge = (name: string): void => {
  const command =  `npx create-electron-app ${name} --template=typescript`;

  console.log(command);
};
