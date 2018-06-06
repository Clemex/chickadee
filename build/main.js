"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chickadee_grammar_1 = require("./chickadee-grammar");
var chickadee_rewrite_1 = require("./chickadee-rewrite");
//import { Chickadee } from './chickadee-part0'; // Tests fail, does nothing but output the AST for each test. 
//import { Chickadee } from './chickadee-part1'; // Numerical expresssion only
//import { Chickadee } from './chickadee-part2'; // Still numerical with introduction of scope
//import { Chickadee } from './chickadee-part3'; // Introduction of variables 
//import { Chickadee } from './chickadee-part4'; // Conditionals, booleans, and related ops  
//import { Chickadee } from './chickadee-part5'; // Support for proper scoping
var chickadee_part6_1 = require("./chickadee-part6"); // Support for defining and invoking lambdas (anonymous functions)
// The test inputs + expected results are an array of tuples
var testResults = [
    // Numerical 
    ["42;", 42],
    ["(42);", 42],
    ["6 * 7;", 42],
    ["(3 + 4) * 6;", 42],
    ["(3 + (2 * 2)) * 6;", 42],
    ["1 + 2 - 3 + 4;", 4],
    ["(1 + 2) - (3 + 4);", -4],
    // Variables 
    ["var x = 42;", 42],
    ["var x = 42; x;", 42],
    ["var x = 6; x = x * 7;", 42],
    ["var x = 41; x = 42;", 42],
    ["var x = 13; x + 14;", 27],
    ["var x = 13; x = x + 15; x;", 28],
    ["var x = 3; var y = 4; x = y; x;", 4],
    // Conditionals
    ["var b = true; var x = b ? 3 : 4; x;", 3],
    // Blocks
    ["{}", undefined],
    ["{ var x = 41; x = 42; }", 42],
    ["var x = 3; var y = 4; { var x = 5; y = x; } x;", 3],
    ["var x = 3; var y = 4; { var x = 5; y = x; } y;", 5],
    // Lambdas 
    ["var f = (x) => { x + 1; }; f(5);", 6],
    ["var x = 5; var f = (y) => y + x; x = 8; f(4);", 12],
    ["var fib = (x) => x <= 1 ? 1 : fib(x - 1) + fib(x - 2); fib(7);", 21],
    ["var fact = (x) => x <= 1 ? 1 : x * fact(x - 1); fact(5);", 120],
];
function parse(input) {
    // Do the initial parsing using the Myna grammar 
    var rawAst = chickadee_grammar_1.chickadeeParser(input);
    // Check the whole input was parsed 
    if (rawAst.end != input.length)
        throw new Error("Whole input was not parsed");
    // Simplify the expression (e.g. a + b + c => (a + b) + c)
    // And removing superfluous nodes that result from precedence rules in the grammar 
    var cleanAst = chickadee_rewrite_1.mapAst(rawAst, chickadee_rewrite_1.rewriteExpr);
    // Get the typed version of the AST         
    var typedAst = chickadee_part6_1.Chickadee.toTypedAst(cleanAst);
    return typedAst;
}
function runTests() {
    var nPassed = 0;
    var nTotal = 0;
    for (var _i = 0, testResults_1 = testResults; _i < testResults_1.length; _i++) {
        var test = testResults_1[_i];
        var input = test[0];
        nTotal++;
        try {
            console.log('Testing input: ');
            console.log(input);
            var node = parse(input);
            console.log("Evaluating");
            var v = chickadee_part6_1.Chickadee.evaluate(node);
            console.log(JSON.stringify(v));
            // Notice the wonderful '===' (read strict equals) of JavaScript which means 
            // compare without casting (coercion)
            if (v === test[1]) {
                console.log("PASSED");
                nPassed++;
            }
            else {
                // TypeScript (like JS) supports template strings (notice they are 
                // backticks and not single apostrophes) which allow interpolated values
                console.log("FAILED, expected " + test[1] + " but got " + v);
            }
        }
        catch (e) {
            console.log('FAILED, error occured: ' + e.message);
        }
    }
    console.log("All tests " + nPassed + "/" + nTotal);
}
//console.log(chickadeeGrammarString);
runTests();
//# sourceMappingURL=main.js.map