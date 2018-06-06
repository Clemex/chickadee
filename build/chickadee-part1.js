"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is an implementation of Chickadee that can only parse and evaluate numerical expressions.
 * Expressions consists of numbers, parentheses, and the operators +,-,*,/,%
 */
var Chickadee;
(function (Chickadee) {
    /**
     * Given the string representation of an operator, and its arguments (as nodes in the tree) we use this
     * to look up a function that we can store with that will perform evaluation.
     */
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
    /**
     * This function converts from the untyped Myna representation of a node (which is hard to work with)
     * into a strongly typed version of the node that has a representation. This is the last point at which
     * we have to use indexes to walk the parse tree. We assume that the AST has been cleaned up using
     * the chickadee-rewrite.ts module.
     */
    function toTypedAst(ast) {
        switch (ast.name) {
            case 'code':
                return {
                    type: 'code',
                    statements: ast.children.map(toTypedAst),
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
    /**
     * Given a node in the AST (a constant, an operator, or a sequence of statements)
     * returns a value.
     */
    function evaluate(node) {
        switch (node.type) {
            case 'const':
                {
                    // We have already worked out the value, and just need to return it. 
                    return node.value;
                }
            case 'operator':
                {
                    // The ... or spread or destructuring operator expands the elements 
                    // of an array one by one. It also works on objects. 
                    return (_a = node.func).call.apply(_a, [null].concat(node.args.map(function (a) { return evaluate(a); })));
                }
            case 'code':
                {
                    // A reduce function is a compact way of writing a for loop, that
                    // reduces or aggregates the items of an array using a function.
                    // In this case we just ignore the accumulator return the last value
                    return node.statements.reduce(function (acc, st) { return evaluate(st); }, null);
                }
        }
        var _a;
    }
    Chickadee.evaluate = evaluate;
})(Chickadee = exports.Chickadee || (exports.Chickadee = {}));
//# sourceMappingURL=chickadee-part1.js.map