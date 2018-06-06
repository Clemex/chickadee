/** 
 * This version of Chickadee supports variable declarations, variable references, and variable assignment, 
 * but no scopes.
 */ 
export module Chickadee
{
    export type Value = any;

    /** Assignments, variable declarations, and variable references are added as new node types in the AST. */ 
    export type Node = 
        | Nodes.Code
        | Nodes.Const 
        | Nodes.Operator 
        | Nodes.Assign 
        | Nodes.VarDecl
        | Nodes.VarRef; 
  
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

        /** Represents the assignment of a value to a named variable. */
        export interface Assign {
            type: 'assign';
            name: string;
            value: Node;
        }

        /** Represents the reference to a named variable. */
        export interface VarRef {
            type: 'var';
            name: string;
        }

        /** Represents the declaration of a named variable with an initial value. */
        export interface VarDecl {
            type: 'decl';
            name: string;
            value: Node;
        }
    }

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
            case 'varName': 
                return { 
                    type: 'var', 
                    name: ast.allText 
                }
            case 'varDecl': 
                return { 
                    type: 'decl', 
                    name: ast.children[0].allText, 
                    value: toTypedAst(ast.children[1]),
                }
            case 'assignmentExpr':
                return { 
                    type: 'assign', 
                    name: ast.children[0].allText, 
                    // NOTE: we are assuming the operator (ast.children[1].children[0] is "="
                    value: toTypedAst(ast.children[1].children[1]) 
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
            case 'varDecls':
            case 'varDeclStatement':
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
                return node.statements.reduce((acc, st) => evaluate(st, env), null);
            }            
            case 'assign':
            {
                return env.setValue(node.name, evaluate(node.value, env));
            }
            case 'var':
            {
                return env.getValue(node.name);
            }
            case 'decl':
            {
                return env.declValue(node.name, evaluate(node.value, env));
            }
        } 
    }
}