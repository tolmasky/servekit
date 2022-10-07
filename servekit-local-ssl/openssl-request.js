const { join } = require("path");
const { existsSync: exists, readFileSync: read } = require("fs");

const openssl = require("./openssl");
const toImmutableDestination = require("./to-immutable-destination");


module.exports = async function ({ x509, destination, json, ...rest })
{
    const reqPath = join(destination, `public.${x509 ? "crt" : "csr"}`);
    const keyPath = join(destination, "private.key");

    // FIXME: Make sure it's up to date.
    if (exists(reqPath) && exists(keyPath))
        return await format(json, destination, reqPath);

    const { lifespan, bits, configuration = { } } = rest;

    await openssl(
        "req",
        // Output a self signed certificate instead of a certificate request.
        ...(x509 ? ["-x509"] : []),
        // Don't encrypt the private key.
        "-nodes",
        // Make the key too.
        "-new", "-newkey", `rsa:${bits}`,
        ...(x509 ? ["-days", lifespan] : []),
        "-keyout", keyPath,
        "-out", reqPath,
        "-sha256",
        "-subj", Object
            .entries(configuration)
            .map(([key, value]) => `/${key}=${value}`)
            .join(""));

    return await format(json, destination, reqPath);
};

async function format(asJSONString, path, reqPath)
{
    return !asJSONString ?
        path :
        JSON.stringify(
        {
            path,
            sha256: (await openssl(
                "x509",
                "-noout",
                "-fingerprint",
                "-sha256",
                "-inform", "pem",
                "-in", reqPath))
                    .stdout
                    .match(/(?<=^SHA256\sFingerprint=)[^\n]+/)[0]
                    .replace(/:/g, ""),
            certificate: read(reqPath, "utf-8")
        });
}
