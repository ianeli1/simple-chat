// Hacky way to disabled picky typescript setup verification
const originalModuleLoad = Module._load;
Module._load = function (request, parent) {
  const originalReturn = originalModuleLoad.apply(this, arguments);
  if (request.includes("verifyTypeScriptSetup")) {
    return () => {};
  }
  return originalReturn;
};
