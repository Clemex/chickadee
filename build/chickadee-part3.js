"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This version of Chickadee supports variable declarations, variable references, and variable assignment,
 * but no scopes.
 */
var Chickadee;
(function (Chickadee) {
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
            case 'varName':
                return {
                    type: 'var',
                    name: ast.allText
                };
            case 'varDecl':
                return {
                    type: 'decl',
                    name: ast.children[0].allText,
                    value: toTypedAst(ast.children[1]),
                };
            case 'assignmentExpr':
                return {
                    type: 'assign',
                    name: ast.children[0].allText,
                    // NOTE: we are assuming the operator (ast.children[1].children[0] is "="
                    value: toTypedAst(ast.children[1].children[1])
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
            case 'varDecls':
            case 'varDeclStatement':
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
                    return node.statements.reduce(function (acc, st) { return evaluate(st, env); }, null);
                }
            case 'assign':
                {
                    return env.setValue(node.name, evaluate(node.value, env));
                }
            case 'var':
                {
                    return env.getValue(node.name);
                }
            case 'decl':
                {
                    return env.declValue(node.name, evaluate(node.value, env));
                }
        }
        var _a;
    }
    Chickadee.evaluate = evaluate;
})(Chickadee = exports.Chickadee || (exports.Chickadee = {}));
//# sourceMappingURL=chickadee-part3.js.map