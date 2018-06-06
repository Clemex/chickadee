"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Transform all ast nodes in the tree 
function mapAst(node, f) {
    if (node.children)
        node.children = node.children.map(function (c) { return mapAst(c, f); });
    var r = f(node);
    return r;
}
exports.mapAst = mapAst;
// Generates a new node. 
function makeNode(rule, src, text) {
    var children = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        children[_i - 3] = arguments[_i];
    }
    return rule.node.apply(rule, [text].concat(children));
}
exports.makeNode = makeNode;
// Some expressions are parsed as a list of expression. 
// (a [op b].*) 
// We want to make sure these expressions always have two children. 
// (a op b op c op d) => (((a op b) op c) op d)
// (a op b) => (a op b)
// (a) => a 
function rewriteExpr(node) {
    // We are only going to handle certain cases
    switch (node.name) {
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
        var right = node.children[node.children.length - 1];
        for (var i = node.children.length - 2; i >= 0; --i) {
            var left = node.children[i];
            right = makeNode(node.rule, node, '', left, right);
        }
        return right;
    }
    else {
        // More than two, we are going to shift things to the left-side
        var left = node.children[0];
        for (var i = 1; i < node.children.length; ++i) {
            var right = node.children[i];
            left = makeNode(node.rule, node, '', left, right);
        }
        return left;
    }
}
exports.rewriteExpr = rewriteExpr;
//# sourceMappingURL=chickadee-rewrite.js.map