const request = require("./openssl-request");
const toImmutableDestination = require("./to-immutable-destination");


module.exports = async (
{
    bits = 3072,
    configuration = "a",
    lifespan = 365 * 1000 // How long should this authority last
}, destination) => await request(
{
    bits,
    configuration,
    lifespan,
    x509: true,
    destination:
        toImmutableDestination(destination, { bits, configuration, lifespan })
});
