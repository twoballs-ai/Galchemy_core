// userCodeRunner.js
export async function runUserCode(code, api, emitter) {
  const wrapped = `
    (async () => {
      ${code}
      if (typeof runLogic === 'function') {
        await runLogic(api);
      } else {
        console.warn("Функция runLogic(api) не найдена.");
      }
    })();
  `;
  
  try {
    await eval(wrapped);
  } catch (err) {
    console.error("Ошибка выполнения пользовательского кода:", err);
    emitter.emit('userCodeError', { error: err.message });
  }
}
