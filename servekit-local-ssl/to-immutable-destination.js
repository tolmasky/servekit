const { join } = require("path");

const mkdirp =
    ((mkdir, normalize) =>
        path => (mkdir(path, { recursive: true }), normalize(path)))
    (require("fs").mkdirSync, require("path").normalize);

const toNormalizedValue = value =>
    !value || typeof value !== "object" ? value :
    Array.isArray(value) ? value.map(toNormalizedValue) :
    Object.fromEntries(Object
        .keys(value)
        .sort()
        .map(key => [key, toNormalizedValue(value[key])]));

const getSHA512Checksum = contents => require("crypto")
    .createHash("sha512")
    .update(contents)
    .digest()
    .toString("base64")
    .replace(/\//g, "_");

module.exports = (destination, object) =>
    mkdirp(join(destination,
        getSHA512Checksum(JSON.stringify(toNormalizedValue(object)))));
