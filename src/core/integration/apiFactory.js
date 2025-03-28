import { spriteApi } from './API/spriteApi';

export function createAPI({ core }) {
    return {
      ...spriteApi({ core }),
    //   ...physicsAPI(core),
    //   ...imageAPI(core),
      log: console.log,
    };
  }
  