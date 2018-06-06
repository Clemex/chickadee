"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This version of Chickadee introduces a simple environment that binds names to values.
 * This version of the environment does not support scopes: all names are considered global.
 *  It does not yet support variable declarations, variable references, or variable assignment.
 */
var Chickadee;
(function (Chickadee) {
    /**
     * This is a simple environment with a single shared scope.
     * It stores bindings between variable names and values.
     * This version makes no distinction between declaring a variable and setting it.
     */
    var Env = /** @class */ (function () {
        function Env() {
            this.scope = {};
        }
        Env.prototype.getValue = function (name) { return this.scope[name]; };
        Env.prototype.setValue = function (name, value) { return this.scope[name] = value; };
        Env.prototype.declValue = function (name, value) { return this.scope[name] = value; };
        return Env;
    }());
    Chickadee.Env = Env;
    function makeOperator(op, args) {
        var opFuncs = {
            '+': function (x, y) { return x + y; },
            '-': function (x, y) { return x - y; },
            '*': function (x, y) { return x * y; },
            '/': function (x, y) { return x / y; },
            '%': function (x, y) { return x % y; },
        };
        if (!(op in opFuncs))
            throw new Error("Unhandled operator: " + op);
        return { type: 'operator', func: opFuncs[op], args: args };
    }
    function toTypedAst(ast) {
        switch (ast.name) {
            case 'code':
                return {
                    type: 'code',
                    statements: ast.children.map(toTypedAst)
                };
            case 'number':
                return {
                    type: 'const',
                    value: parseFloat(ast.allText)
                };
            case 'multiplicativeExpr':
            case 'additiveExpr':
                {
                    var a = toTypedAst(ast.children[0]);
                    var op = ast.children[1].children[0].allText;
                    var b = toTypedAst(ast.children[1].children[1]);
                    return makeOperator(op, [a, b]);
                }
            case 'parenExpr':
            case 'exprStatement':
                return toTypedAst(ast.children[0]);
        }
        throw new Error("Not a recognized AST type: " + ast.name);
    }
    Chickadee.toTypedAst = toTypedAst;
    function evaluate(node, env) {
        if (env === void 0) { env = new Env(); }
        switch (node.type) {
            case 'const':
                {
                    return node.value;
                }
            case 'operator':
                {
                    return (_a = node.func).call.apply(_a, [null].concat(node.args.map(function (a) { return evaluate(a, env); })));
                }
            case 'code':
                {
                    return node.statements.reduce(function (acc, st) { return evaluate(st); }, null);
                }
        }
        var _a;
    }
    Chickadee.evaluate = evaluate;
})(Chickadee = exports.Chickadee || (exports.Chickadee = {}));
//# sourceMappingURL=chickadee-part2.js.map