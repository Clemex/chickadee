"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Chickadee;
(function (Chickadee) {
    var Env = /** @class */ (function () {
        function Env() {
            this.scopes = [{}];
        }
        Env.prototype.pushScope = function () { this.scopes.push({}); };
        Env.prototype.popScope = function () { this.scopes.pop(); };
        Env.prototype.findScope = function (name) { return this.scopes.filter(function (s) { return name in s; }).reverse()[0]; };
        Env.prototype.getValue = function (name) { return this.findScope(name)[name]; };
        Env.prototype.setValue = function (name, value) { return this.findScope(name)[name] = value; };
        Env.prototype.declValue = function (name, value) { return this.scopes[this.scopes.length - 1][name] = value; };
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
                    // NOTE: we are assuming the operator (ast.children[1].children[0] is "="
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
            case 'lambdaExpr':
                return {
                    type: 'lambda',
                    params: ast.children[0].children.map(function (c) { return c.allText; }),
                    body: toTypedAst(ast.children[1]),
                };
            case 'postfixExpr':
                if (ast.children[1].name === 'funCall') {
                    return {
                        type: 'call',
                        func: toTypedAst(ast.children[0]),
                        args: ast.children[1].children.map(toTypedAst),
                    };
                }
                else
                    break;
            case 'code':
            case 'compoundStatement':
                return {
                    type: 'code',
                    statements: ast.children.map(toTypedAst)
                };
            case 'parenExpr':
            case 'varDecls':
            case 'varDeclStatement':
            case 'exprStatement':
            case 'lambdaBody':
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
            case 'call':
                {
                    env.pushScope();
                    var f = evaluate(node.func, env);
                    for (var i = 0; i < f.params.length; ++i) {
                        var argValue = evaluate(node.args[i], env);
                        env.declValue(f.params[i], argValue);
                    }
                    var r = evaluate(f.body, env);
                    env.popScope();
                    return r;
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
            case 'code':
                {
                    env.pushScope();
                    var r = undefined;
                    for (var _i = 0, _a = node.statements; _i < _a.length; _i++) {
                        var st = _a[_i];
                        r = evaluate(st, env);
                    }
                    env.popScope();
                    return r;
                }
            case 'operator':
                {
                    return (_b = node.func).call.apply(_b, [null].concat(node.args.map(function (a) { return evaluate(a, env); })));
                }
            case 'lambda':
                {
                    return node;
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
        }
        var _b;
    }
    Chickadee.evaluate = evaluate;
})(Chickadee = exports.Chickadee || (exports.Chickadee = {}));
//# sourceMappingURL=chickadee-part6.js.map