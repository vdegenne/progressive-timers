import {port, publicDir} from './options';

export default {
  port: port,
  rootDir: publicDir,
  nodeResolve: true,
  preserveSymlinks: true,
  middlewares:
      [
        // add the middlewares here
      ]
}