module.exports = function override(config, env) {
  // Suppress "Critical dependency: the request of a dependency is an expression" warning
  // This warning is coming from dependencies and not our code
  config.ignoreWarnings = [
    /Critical dependency: the request of a dependency is an expression/,
  ];
  
  return config;
};
