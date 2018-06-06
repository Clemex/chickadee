/** 
 * This is skeleton of the implementation of our Chickadee interpreter.
 * All of the tests will fail, but it will successfully compile and run
 * outputting the parse tree for each test input string.
 */  
export module Chickadee
{
     /** 
     * The Value represents the result of evaluating an expression, statement, or block of code. 
     * To keep our interpreter simple we define it to be anything that JavaScript accepts as a value.
     */    
    export type Value = any;

    /**
     * This is be the "typed" version of a node in an abstract syntax tree (AST) that is specific 
     * to Chickadee. For now, we leave it as an alias to the Myna node.
     */
    export type Node = UntypedAstNode;

    /** 
     * The Myna parsing library generates an untyped abstract syntax tree (AST) based on the grammar.
     * Any rule in the grammar marked as an AST creates a new node in the tree, with a string label that 
     * corresponds to the syntax rule name. This interface represent the most relevant part of the Myna 
     * AST node without requiring us to import the full definition. 
     */    
    export interface UntypedAstNode {
        name: string;
        allText: string;
        children: UntypedAstNode[];
    }
  
    /** 
     * The is a stub for a function that will convert from a node in the Myna AST to a node in the 
     * Chickadee AST. This function will  be filled out by us in later steps, once we have different 
     * implementations of node. 
      */
    export function toTypedAst(ast: UntypedAstNode): Node {
        return ast;
    }

    /**
     * This is the stub for the interpreter's evaluate function. 
     * This is will take a node from the typed AST and return a value.
     * For now it just returns the text contents of a node.   
     */
    export function evaluate(node: Node): Value {
        return node.allText;
    }
}