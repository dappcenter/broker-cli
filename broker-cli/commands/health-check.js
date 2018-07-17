const BrokerDaemonClient = require('../broker-daemon-client')
const { ENUMS, validations } = require('../utils')
const { STATUS_CODES } = ENUMS

/**
 * kcli healthcheck
 *
 * Tests the broker and engine connection for the cli
 *
 * ex: `kcli healthcheck`
 *
 * @param {Object} args
 * @param {Object} opts
 * @param {String} [rpcAddress] broker rpc address
 * @param {Logger} logger
 */

async function healthCheck (args, opts, logger) {
  const { rpcAddress = null } = opts

  try {
    const client = await new BrokerDaemonClient(rpcAddress)

    const { engineStatus, relayerStatus } = await client.adminService.healthCheck({})

    // TODO: If `engineStatus` or `relayerStatus` is undefined, then we will not see
    // a status
    const res = {
      engines: engineStatus.reduce((acc, { symbol, status }) => {
        acc[symbol] = status
        return acc
      }, {}),
      relayerStatus,
      daemonStatus: STATUS_CODES.OK
    }

    logger.info(`HealthCheck: ${JSON.stringify(res, null, '  ')}`)
  } catch (e) {
    logger.error(e)
  }
};

module.exports = (program) => {
  program
    .command('healthcheck', 'Checks the connection between Broker and the Exchange')
    .option('--rpc-address', 'Location of the RPC server to use.', validations.isHost)
    .action(healthCheck)
}