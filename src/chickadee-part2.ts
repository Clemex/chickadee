/** 
 * This version of Chickadee introduces a simple environment that binds names to values.
 * This version of the environment does not support scopes: all names are considered global.
 *  It does not yet support variable declarations, variable references, or variable assignment.  
 */
export module Chickadee
{
    export type Value = any;

    export type Node = Nodes.Code | Nodes.Const | Nodes.Operator; 
  
    export module Nodes 
    {
        export interface Code {
            type: 'code';
            statements: Node[];
        }
        
        export interface Const {
            type: 'const';
            value: Value;
        }

        export interface Operator {
            type: 'operator';
            func: Function;
            args: Node[];
        }
    }

    /** 
     * This is a simple environment with a single shared scope.
     * It stores bindings between variable names and values. 
     * This version makes no distinction between declaring a variable and setting it.
     */
    export class Env 
    {       
        scope = {};
        getValue(name: string): Value { return this.scope[name]; }
        setValue(name: string, value: Value): Value { return this.scope[name] = value; }   
        declValue(name: string, value: Value): Value { return this.scope[name] = value; }
    }

    export interface UntypedAstNode {
        name: string;
        allText: string;
        children: UntypedAstNode[];
    }

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

    export function toTypedAst(ast: UntypedAstNode): Node {
        switch (ast.name) {
            case 'code': 
                return {
                    type: 'code',
                    statements: ast.children.map(toTypedAst)
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

    export function evaluate(node: Node, env: Env = new Env()): Value 
    {
        switch (node.type) 
        {
            case 'const':
            {
                return node.value;
            }
            case 'operator':
            {
                return node.func.call(null, ...node.args.map(a => evaluate(a, env)));
            }
            case 'code':
            {
                return node.statements.reduce((acc, st) => evaluate(st), null);
            }            
        } 
    }
}