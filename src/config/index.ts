export interface Config {
  server: {
    port: number;
    name: string;
  };
  app: {
    port: number;
    name: string;
  };
  publicDir: string;
  projectsDir: string;
}

export const config: Config = {
  server: {
    port: parseInt(process.env.SERVER_PORT || '9023', 10),
    name: process.env.SERVER_NAME || 'localhost',
  },
  app: {
    port: parseInt(process.env.APP_PORT || '3000', 10),
    name: process.env.APP_NAME || 'localhost',
  },
  publicDir: 'public',
  projectsDir: 'public/projects',
};
