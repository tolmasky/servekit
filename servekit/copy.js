const given = f => f();
const { basename, join } = require("path");


const { Δ, type } = require("@algebraic/type");
const { tagged } = require("@reified/function");
const array = require("./array");
const glob = require("./glob");

const { RestEntries } = require("generic-jsx");

const include = type `include`
({
    source      :of =>  type.string,
    destination :of => type.string
});

const toChildren = indexes => Object.assign(Array.from({ length: Object.keys(indexes).reverse()[0] }), indexes);

const instruction = tagged `instruction` ((name, definition) => given((
    Instruction = type `${name}` (definition)) =>
        Object.assign(Instruction,
        {
            reduce: (state, { attributes: { [RestEntries]: children, ...attributes } }) => state
                .Δ(dockerfile => dockerfile
                    .Δ(instructions => (console.log("CHILDREN: ",children),[...instructions, children ? Instruction({ children: toChildren(children) }) : Instruction(attributes)]))),
            toBoundArguments: x => [x],
        })));


global.env = instruction `env` 
({
    key :of => type.string,
    value   :of => type.string
});

global.run = instruction `run`
({
    children    :of => array `=` ([])
});

global.cmd = instruction `cmd`
({
    children    :of => array `=` ([])
});

console.log(global.env.apply(global.env, [{ key:"hi", value:"bye" }]));

exports.copy = (state, source, destination) => state
    .Δ(dockerfile => dockerfile
        .Δ(instructions =>(console.log(state.workspace, source, glob({ origin: state.workspace, patterns: [source] })),
            [...instructions,  ...glob({ origin: state.workspace, patterns: [source] })
                .map(source => include({ source, destination: join(destination, basename(source)) }))])));


/*
state
    .Δ(dependencies =>
        [...dependencies, ...glob({ origin: state.workspace, patterns: [source] })])
    .Δ(dockerfile => dockerfile
        .Δ(instructions =>
            [...instructions, `COPY ${source} ${destination}`]));
*/
/*
exports.copy = ({ state, source, destination }) => state
    .Δ(dependencies =>
        [...dependencies, ...glob({ origin: state.workspace, patterns: [source] })])
    .Δ(dockerfile => dockerfile
        .Δ(instructions =>
            [...instructions, `COPY ${source} ${destination}`]));
*/
exports.image = (state, from, workspace, ...children) => {
    const _workspace = workspace;
    const _from = from;
    return reduce(state
    .Δ(workspace => _workspace)
    .Δ(dockerfile => dockerfile
        .Δ(from => _from || "scratch")),
    children);
}
global.copy = exports.copy;
global.image = exports.image;

/*global.env = (state, key, value) => state
    .Δ(dockerfile => dockerfile
        .Δ(instructions => [...instructions, ENV({ key, value })]));
*/
//const start = DockerfileState({ workspace: process.cwd() });
//console.log(Δ);
//console.log(start);
//console.log(copy(copy(start, { from: "*", to: "/" }), { from: "..", to: "/" }));

console.log("DONE!");
//completed: (files, { context_tar, dockerfile })
//in process: (files, { instructions })

//ignore stuff is important

/*
const push = (items, items) => [...items, ...items];

const copy = (state, { from, to }) => state
    .Δ(instructions =>
        [...instructions, ...glob(state.workspace, from).map(include)]);
        
const 



    state.instructions.push(
    exports.copy = (state, source, destination) => state
    .Δ(dockerfile => dockerfile
        .Δ(instructions =>
            [...instructions,  ...glob({ origin: state.workspace, patterns: [source] })
                .map(source => include({ source, destination: join(destination, basename(source)) }))]));
    )
*/

//<copy a = { a } b = { b } /> TO BE copy{a,b} -> base_type ... 

//(state, { a, b, c, children }) => 