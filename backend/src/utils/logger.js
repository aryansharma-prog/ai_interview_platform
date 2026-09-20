/* Minimal structured logger. Swap for winston/pino in production if desired. */
const levelColor = { info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m' };

function log(level, message) {
  const time = new Date().toISOString();
  const color = levelColor[level] || '';
  // eslint-disable-next-line no-console
  console.log(`${color}[${time}] [${level.toUpperCase()}]${levelColor.reset} ${message}`);
}

module.exports = {
  info: (msg) => log('info', msg),
  warn: (msg) => log('warn', msg),
  error: (msg) => log('error', msg),
};
