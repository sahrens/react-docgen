/*
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 *
 */

/*eslint no-labels: 0*/

/**
 * Helper methods for dealing with MemberExpressions (and CallExpressions).
 */

type MemberDescriptor = { // eslint-disable-line no-undef
  path: NodePath;
  computed: boolean;
  argumentsPath?: ?NodePath;
}

import recast from 'recast';

var {types: {namedTypes: types}} = recast;

/**
 * Given a "nested" Member/CallExpression, e.g.
 *
 * foo.bar()[baz][42]
 *
 * this returns a list of "members". In this example it would be something like
 * [
 *   {path: NodePath<bar>, arguments: NodePath<empty>, computed: false},
 *   {path: NodePath<baz>, arguments: null, computed: true},
 *   {path: NodePath<42>, arguments: null, computed: false}
 * ]
 */
export default function getMembers(path: NodePath): Array<MemberDescriptor> {
  var result = [];
  var argumentsPath = null;
  loop: while(true) { // eslint-disable-line no-constant-condition
    switch (true) {
      case types.MemberExpression.check(path.node):
        result.push({
          path: path.get('property'),
          computed: path.node.computed,
          argumentsPath: argumentsPath,
        });
        argumentsPath = null;
        path = path.get('object');
        break;
      case types.CallExpression.check(path.node):
        argumentsPath = path.get('arguments');
        path = path.get('callee');
        break;
      default:
        break loop;
    }
  }
  return result.reverse();
}
