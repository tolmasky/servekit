#!/usr/bin/env -S clf

const given = f => f();

const { join, resolve } = require("path");
const { getBindingOf, bind } = require("generic-jsx");
const spawn = require("@await/spawn");
//const HOME = require("home");
//const toMatcher = require("nanomatch").matcher;
const array = require("./array");
const type = require("@algebraic/type");

require("./copy");

const DockerfileState = type `DockerfileState`
({
    dockerfile      :of =>  Dockerfile `=` (Dockerfile()),
    workspace       :of =>  type.string,
    dependencies    :of =>  array `=` ([])
});

const Dockerfile = type `Dockerfile`
({
    from            :of =>  type.string `=` ("scratch"),
    instructions    :of =>  array `=` ([])
});

const c = type `curried<copy>`
({
    source      :of => type.string,
    destination :of => type.string
});

module.exports = async function (entrypoint)
{
    require("@babel/register")
    ({
        ignore:[new RegExp(`^.*/node_modules/.*`, "i")],
        plugins:
        [[
            require("@generic-jsx/babel-plugin"),
            { importSource: require.resolve("generic-jsx") }
        ]],
        cache: false,
    });
console.log(require("@generic-jsx/babel-plugin")+"");
    const start = DockerfileState({ workspace: process.cwd() });

    const fImage = require(resolve(process.cwd(), entrypoint));
    console.log(fImage+"");
    const Dockerfile_ = reduce(start, bind(fImage, { hash: "dev" }, []));

    const f = (a,b)=>a+b;
    f.source = "hi";
    f.destination = "bye";
    Object.setPrototypeOf(f, c.prototype);

    console.log(f);

    console.log(Dockerfile_);
    console.log(Dockerfile_.dockerfile.instructions);
/*
    console.log(image);
    const start = Date.now();
    console.log("-", image.toPatternSet(), "-");
    console.log(Date.now() - start);

    await watch(HOME, image.toPatternSet());
console.log("what...");*/
// await new Promise((resolve, reject) => {});
//    tar("./test.tar", image.toFileSet());
}

global.reduce = function reduce(state, element)
{
    // FIXME: Due to JSXTexts floating around...
    if (typeof element === "string")
        return state;

    if (element === false)
        return state;

    if (Array.isArray(element))
        return element
            .flat()
            .reduce(reduce, state);

    if (typeof element !== "function")
        return element;

//    return [uState, chained] = reduce(state, element({ state }));

    const reducer = getBindingOf(element).reduce || element;
console.log(reducer, state);
    return reduce(state, reducer === element ? reducer(state) : reducer(state, element));
}