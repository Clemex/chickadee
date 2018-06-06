# The Chickadee Programming Language 

This is a very simple interpreter for a minimalist programming language called Chickadee built for an internal tech talk at [Clemex technologies](http://www.clemex.com).

Chickadee was developed for teaching how to build simple interpreters using TypeScript, aimed at people not necessarily very familiar with TypeScript. 

The Chickadee evaluator executes a pre-processed typed abstract syntax tree. The parser is in a separate file and has a dependency on the Myna parsing library which is a TypeScript syntactic analysis library that is contained in a single file with no additional dependencies.

## How it Works 

The basic logic for how the interpreter works: 

1. Define a grammar (which constructs a parser)
2. Run the parser (which construct an abstract syntax tree or AST) 
3. Clean-up the AST 
    * Assure that binary operations have only two node: a + b + c => (a + b) + c
    * Any expression that has one node is replaced by that child
4. Convert the untyped Myna AST into a typed AST for Chickadee
5. Run the evaluator recursively from the root node 

## Code Structure 

The code entry point is in the file `main.ts`. The `main.ts` has a number of tests and requires three files:
1. `chickadee-grammar.ts` - contains the grammar for a superset of the Chickadee language (in case you want to extend the interpreter) 
2. `chickadee-rewrite.ts` - contains code for pre-processing the AST 
3. `chickadee-partX.ts` - this is the incremental implementation of the interpreter. The part1 contains the most documentation
    about the code, and makes it easiest to see and understand the structure, while part6 contains the "full" implementation of the chickadee language.     
