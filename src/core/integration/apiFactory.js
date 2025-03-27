export function createAPI({ core }) {
    return {
      ...spriteAPI(core),
    //   ...physicsAPI(core),
    //   ...imageAPI(core),
      log: console.log,
    };
  }
  