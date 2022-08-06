const { Δ, type } = require("@algebraic/type");
const array = require("./array");
const glob = require("./glob");




exports.copy = ({ state, source, destination }) => state
    .Δ(dependencies =>
        [...dependencies, ...glob({ origin: state.workspace, patterns: [source] })])
    .Δ(dockerfile => dockerfile
        .Δ(instructions =>
            [...instructions, `COPY ${source} ${destination}`]));

exports.image = ({ state, from: mFrom, workspace: mWorkspace, children }) => reduce(state
    .Δ(workspace => mWorkspace)
    .Δ(dockerfile => dockerfile
        .Δ(from => mFrom || "scratch")),
    children);

global.copy = exports.copy;
global.image = exports.image;

//const start = DockerfileState({ workspace: process.cwd() });
//console.log(Δ);
//console.log(start);
//console.log(copy(copy(start, { from: "*", to: "/" }), { from: "..", to: "/" }));

console.log("DONE!");
//completed: (files, { context_tar, dockerfile })
//in process: (files, { instructions })

//ignore stuff is important

