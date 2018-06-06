"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This version of Chickadee introduces support for conditional expressions, boolean values,
 * and boolean operators.
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
            '>': function (x, y) { return x > y; },
            '<': function (x, y) { return x < y; },
            '>=': function (x, y) { return x >= y; },
            '<=': function (x, y) { return x <= y; },
            '==': function (x, y) { return x === y; },
            '!=': function (x, y) { return x !== y; },
            '||': function (x, y) { return x || y; },
            '&&': function (x, y) { return x && y; },
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
            case 'bool':
                return {
                    type: 'const',
                    value: ast.allText === 'true',
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
                    value: toTypedAst(ast.children[1].children[1])
                };
            case 'relationalExpr':
            case 'equalityExpr':
            case 'logicalAndExpr':
            case 'logicalOrExpr':
            case 'multiplicativeExpr':
            case 'additiveExpr':
                {
                    var a = toTypedAst(ast.children[0]);
                    var op = ast.children[1].children[0].allText;
                    var b = toTypedAst(ast.children[1].children[1]);
                    return makeOperator(op, [a, b]);
                }
            case 'conditionalExpr':
                return {
                    type: 'cond',
                    cond: toTypedAst(ast.children[0]),
                    onTrue: toTypedAst(ast.children[1].children[0]),
                    onFalse: toTypedAst(ast.children[1].children[1])
                };
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
            case 'assign':
                {
                    var rValue = evaluate(node.value, env);
                    return env.setValue(node.name, rValue);
                }
            case 'var':
                {
                    return env.getValue(node.name);
                }
            case 'operator':
                {
                    return (_a = node.func).call.apply(_a, [null].concat(node.args.map(function (a) { return evaluate(a, env); })));
                }
            case 'cond':
                {
                    return evaluate(node.cond, env)
                        ? evaluate(node.onTrue, env)
                        : evaluate(node.onFalse, env);
                }
            case 'decl':
                {
                    return env.declValue(node.name, evaluate(node.value, env));
                }
            case 'code':
                {
                    return node.statements.reduce(function (acc, st) { return evaluate(st, env); }, null);
                }
        }
        var _a;
    }
    Chickadee.evaluate = evaluate;
})(Chickadee = exports.Chickadee || (exports.Chickadee = {}));
//# sourceMappingURL=chickadee-part4.js.map