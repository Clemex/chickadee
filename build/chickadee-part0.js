"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is skeleton of the implementation of our Chickadee interpreter.
 * All of the tests will fail, but it will successfully compile and run
 * outputting the parse tree for each test input string.
 */
var Chickadee;
(function (Chickadee) {
    /**
     * The is a stub for a function that will convert from a node in the Myna AST to a node in the
     * Chickadee AST. This function will  be filled out by us in later steps, once we have different
     * implementations of node.
      */
    function toTypedAst(ast) {
        return ast;
    }
    Chickadee.toTypedAst = toTypedAst;
    /**
     * This is the stub for the interpreter's evaluate function.
     * This is will take a node from the typed AST and return a value.
     * For now it just returns the text contents of a node.
     */
    function evaluate(node) {
        return node.allText;
    }
    Chickadee.evaluate = evaluate;
})(Chickadee = exports.Chickadee || (exports.Chickadee = {}));
//# sourceMappingURL=chickadee-part0.js.map