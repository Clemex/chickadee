/** 
 * This is an implementation of Chickadee that can only parse and evaluate numerical expressions.
 * Expressions consists of numbers, parentheses, and the operators +,-,*,/,%
 */
export module Chickadee
{
    export type Value = any;

    /** 
     * Here we are using a algebraic type called a "discriminated union" or "tagged union" to represent
     * typed versions of the abstract syntax tree used by the Chickadee interpreter.
     * The type theoretical term for this kind of type is a "sum type". It is a fancy way of saying 
     * the set of "Node" type values is the union of the set of all Const values, Call values, etc. 
     * In traditional OOP languages this kind of functionality is usually achieved by declaring a base
     * class and having the other types derive from it.
     */      
    export type Node = Nodes.Code | Nodes.Const | Nodes.Operator;

    /** Contains the different initial typed AST nodes.  */
    export module Nodes 
    {
        /** Represent a sequence of statement. */
        export interface Code {
            type: 'code';
            statements: Node[];
        }

        /** Represent a constant (literal) value. */
        export interface Const {
            type: 'const';
            value: Value;
        }

        /** Represent a built-in operator expression. */
        export interface Operator {
            type: 'operator';
            func: Function;
            args: Node[];
        }
    }

    export interface UntypedAstNode {
        name: string;
        allText: string;
        children: UntypedAstNode[];
    }

    /** 
     * Given the string representation of an operator, and its arguments (as nodes in the tree) we use this
     * to look up a function that we can store with that will perform evaluation.  
     */
    function makeOperator(op: string, args: Node[]): Node {
        const opFuncs = { 
            '+': (x,y) => x + y,
            '-': (x,y) => x - y,
            '*': (x,y) => x * y,
            '/': (x,y) => x / y,
            '%': (x,y) => x % y,
        }
        if (!(op in opFuncs))
            throw new Error("Unhandled operator: " + op);
        return { type: 'operator', func: opFuncs[op], args }  
    }

    /**
     * This function converts from the untyped Myna representation of a node (which is hard to work with)
     * into a strongly typed version of the node that has a representation. This is the last point at which
     * we have to use indexes to walk the parse tree. We assume that the AST has been cleaned up using 
     * the chickadee-rewrite.ts module.     
     */
    export function toTypedAst(ast: UntypedAstNode): Node {
        switch (ast.name) {
            case 'code':
                return {
                    type: 'code',
                    statements: ast.children.map(toTypedAst),
                }
            case 'number':
                return { 
                    type: 'const', 
                    value: parseFloat(ast.allText) 
                }
            case 'multiplicativeExpr':
            case 'additiveExpr':
            {             
                const a = toTypedAst(ast.children[0]);
                const op = ast.children[1].children[0].allText;  
                const b = toTypedAst(ast.children[1].children[1]);
                return makeOperator(op, [a, b]);
            }
            case 'parenExpr':
            case 'exprStatement':
                return toTypedAst(ast.children[0]);
        }
        
        throw new Error("Not a recognized AST type: " + ast.name);
    }

    /**
     * Given a node in the AST (a constant, an operator, or a sequence of statements) 
     * returns a value.
     */    
    export function evaluate(node: Node): Value 
    {
        switch (node.type) 
        {
            case 'const':
            {
                // We have already worked out the value, and just need to return it. 
                return node.value;
            }
            case 'operator':
            {
                // The ... or spread or destructuring operator expands the elements 
                // of an array one by one. It also works on objects. 
                return node.func.call(null, ...node.args.map(a => evaluate(a)));
            }
            case 'code':
            {
                // A reduce function is a compact way of writing a for loop, that
                // reduces or aggregates the items of an array using a function.
                // In this case we just ignore the accumulator return the last value
                return node.statements.reduce((acc, st) => evaluate(st), null);    
            }
        } 
    }
}