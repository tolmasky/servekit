const { join } = require("path");
const { existsSync: exists } = require("fs");
const write =
    (write => (path, ...rest) => (write(path, ...rest), path))
    (require("fs").writeFileSync)

const openssl = require("./openssl");
const request = require("./openssl-request");

const toImmutableDestination = require("./to-immutable-destination");

const toExtContents = object => Object
    .entries(object)
    .map(([key, value]) =>
        Array.isArray(value) ?
            `${key} = ${value.join(", ")}` :
        typeof value === "string" ?
            `${key} = ${value}`:
            `[${key}]\n${toExtContents(value)}`)
    .join("\n");

    
module.exports = async function (
{
    authority,
    bits = 3072,
    domains = [],
    lifespan = 90
}, destination)
{
    const normalizedDomains = Array.from(new Set(domains)).sort();
    const normalizedOptions =
        { authority, bits, domains: normalizedDomains, lifespan };
    const immutableDestination =
        toImmutableDestination(destination, normalizedOptions);

    const crtPath = join(immutableDestination, "public.crt");
    const keyPath = join(immutableDestination, "private.key");

    if (exists(crtPath) && exists(keyPath))
        return immutableDestination;

    const csrPath = join(await request(
    { 
        ...normalizedOptions,
        configuration: { "CN": domains[0] },
        destination: immutableDestination
    }), "public.csr");

    const extPath = write(join(immutableDestination, "extra.ext"), toExtContents(
    {
        authorityKeyIdentifier: ["keyid", "issuer"],
        basicConstraints: ["critical", "CA:FALSE"],
        keyUsage:
        [
            "critical",
            "digitalSignature",
            "nonRepudiation",
            "keyEncipherment",
            "dataEncipherment"
        ],
        extendedKeyUsage:["serverAuth", "clientAuth"],
        subjectAltName: "@alt_names",
        alt_names: Object.fromEntries(domains
            .map((domain, index) => [`DNS.${index + 1}`, domain]))
    }), "utf-8");

    await openssl("x509",
        "-req",
        "-in", csrPath,
        "-extfile", extPath,
        "-days", lifespan,
        "-CA", join(authority, "public.crt"),
        "-CAkey", join(authority, "private.key"),
        "-CAcreateserial",
        "-out", crtPath,
        "-sha256");

    return immutableDestination;
}
