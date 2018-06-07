# The Chickadee Programming Language 

This is a very simple interpreter for a minimalist programming language called Chickadee built for an internal tech talk at [Clemex technologies](http://www.clemex.com).

Chickadee was developed for teaching how to build simple interpreters using TypeScript, aimed at people not necessarily very familiar with TypeScript. 

Chickadee supports basic numerical and boolean expressions, variables, and lambda-expressions.

Here is an example program. 

```
var fib = (x) => 
   x <= 1 
      ? 1 
      : fib(x - 1) + fib(x - 2); 
fib(7);
```

The Chickadee evaluator executes a pre-processed typed abstract syntax tree. The parser is in a separate file and has a dependency on the Myna parsing library which is a TypeScript syntactic analysis library that is contained in a single file with no additional dependencies.

## Code Structure 

1. `main.ts` - The entry point of the application and contains the main tests. 
1. `chickadee-grammar.ts` - contains the grammar for a superset of the Chickadee language (in case you want to extend the interpreter) 
1. `chickadee-rewrite.ts` - contains code for pre-processing the AST 
1. `chickadee-partX.ts` - this is the incremental implementation of the interpreter. The part1 contains the most documentation
    about the code, and makes it easiest to see and understand the structure, while part6 contains the "full" implementation of the chickadee language.     

## How it Works 

The basic logic for how the interpreter works: 

1. Define a grammar and parser using the Myna library 
2. Execute the generated parser on the input to generate an untyped abstract syntax tree (AST) 
3. Rewrite the AST: 
    * Assure that binary operations have only two node: a + b + c => (a + b) + c
    * Any expression that has one node is replaced by that child
4. Convert the untyped AST into a typed AST for Chickadee
5. Run the evaluation function which converts nodes to values

## The Tutorial

The code is structured as a tutorial, where the modules from `chickadee-part0.ts` to `chickadee-part6.ts` each add more functionality to the basic interpreter. 

(part-0)[https://github.com/Clemex/chickadee/blob/master/src/chickadee-part0.ts]
