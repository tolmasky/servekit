const { spawnSync: spawn_ } = require("child_process");
const find = (...args) => spawn_("find", args).stdout.toString("utf-8");
const findInDocker = (tag, ...args) =>
    spawn_("docker", ["run", "--rm", tag, "find", "/", ...args]);

module.exports = function glob({ origin, patterns })
{
    const local = true;

    // FIXME: We should do "-o -empty -type d" with the same pattern without the
    // trailing piece.
    const optional = local ? "\\{0,1\\}" : "?";
    const globToRegExp = glob =>
        join(local ? origin : "/", glob)
            .replace(/[\?\.]/g, character => `\\${character}`)
            .replace(/\*/g, "[^\/]*") + `\\(/.*\\)${optional}`;

    const command = local ? find : findInDocker;
    const context = (local ? origin : `isx:${origin.ptag}`);console.log(context);
    const contextNoSlash = context.replace(/\/$/, "");
    /*const output = command(
        contextNoSlash,
        "-type", "f",
        "(",
        ...patterns
            .map(globToRegExp)
            .flatMap((pattern, index) =>
                [...(index > 0 ? ["-o"] : []), "-regex", pattern]),
        ")");*/
    const output = command(
        contextNoSlash,
        "-type", "f",
        "-iname", patterns[0]);
//console.log(output);console.log(patterns);
/*console.log(patterns
            .map(globToRegExp)
            .flatMap((pattern, index) =>
                [...(index > 0 ? ["-o"] : []), "-regex", pattern]));*/
    return [...output.matchAll(/([^\n]*)\n/g)]
        .map(([_, filename]) => filename);
}

