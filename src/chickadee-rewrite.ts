/**
 * The rewrite module takes a raw untyped AST generated from a Myna grammar and cleans it 
 * up. E.g. removing superfluous expression nodes, making sure that binary operator expressions
 * have exactly two binary arguments, etc. 
 * 
 * This makes later processing steps much easier.    
 */
import { Myna as m } from "../node_modules/myna-parser/myna";

// Transform all ast nodes in the tree 
export function mapAst(node: m.AstNode, f: (_: m.AstNode) => m.AstNode): m.AstNode {    
    if (node.children)
        node.children = node.children.map(c => mapAst(c, f));
    let r = f(node);
    return r;
}

// Generates a new node. 
export function makeNode(rule: m.Rule, src: m.AstNode|null, text: string, ...children: m.AstNode[]): m.AstNode {
    return rule.node(text, ...children);
}

// Some expressions are parsed as a list of expression. 
// (a [op b].*) 
// We want to make sure these expressions always have two children. 
// (a op b op c op d) => (((a op b) op c) op d)
// (a op b) => (a op b)
// (a) => a 
export function rewriteExpr(node: m.AstNode): m.AstNode {
    // We are only going to handle certain cases
    switch (node.name)
    {    
        case 'assignmentExprLeft':
        case 'conditionalExprLeft':
        case 'rangeExprLeft':
        case 'logicalOrExprLeft':
        case 'logicalXOrExprLeft':
        case 'logicalAndExprLeft':
        case 'equalityExprLeft':
        case 'relationalExprLeft':
        case 'additiveExprLeft':
        case 'multiplicativeExprLeft':
        case 'literal':
        case 'recExpr':
        case 'leafExpr':
        case 'expr':        
            {
                if (node.children.length != 1)
                    throw new Error("Exepcted exactly one child");
                return node.children[0];
            }
        case 'assignmentExpr':
        case 'conditionalExpr':
        case 'rangeExpr':
        case 'logicalOrExpr':
        case 'logicalXOrExpr':
        case 'logicalAndExpr':
        case 'equalityExpr':
        case 'relationalExpr':
        case 'additiveExpr':
        case 'multiplicativeExpr':
        case 'postfixExpr':
        case 'prefixExpr':
            break;
        default: 
            return node;
    }

    // Check there is at least one child
    if (node.children.length == 0)
        throw new Error("Expected at least one child");

    // If there is only one child: we just return that child 
    if (node.children.length == 1) 
        return node.children[0];

    // there are two already: we are done 
    if (node.children.length == 2)
        return node;

    // We are shifting left (in the case of most operations)
    // Or are shifting right in the case of prefix expr 
    if (node.name === 'prefixExpr') {
        // More than two, we are going to shift things to the left-side
        let right = node.children[node.children.length - 1];
        for (let i=node.children.length-2; i >= 0; --i)
        {   
            let left = node.children[i];
            right = makeNode(node.rule, node, '', left, right);
        }
        return right;
    }
    else {
        // More than two, we are going to shift things to the left-side
        let left = node.children[0];
        for (let i=1; i < node.children.length; ++i)
        {   
            let right = node.children[i];
            left = makeNode(node.rule, node, '', left, right);
        }
        return left;
    }
}