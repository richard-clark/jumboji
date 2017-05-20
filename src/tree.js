/*

Implementation of a k-d tree. Sources:

https://en.wikipedia.org/w/index.php?title=K-d_tree&oldid=747622871
https://web.stanford.edu/class/cs106l/handouts/assignment-3-kdtree.pdf

*/

const K = 3;

export function tree(points, key, depth) {
  if (!depth) { depth = 0; }

  if (points.length === 0) {
    return null;
  }

  const axis = depth % K;
  points.sort((a, b) =>
    a[key][axis] - b[key][axis]
  );
  const median = Math.floor(points.length / 2);

  const location = points[median];
  const leftChild = tree(points.slice(0, median), key, depth + 1);
  const rightChild = tree(points.slice(median + 1), key, depth + 1);

  return {location, leftChild, rightChild};
}

// Returns the nearest `n` neighbors for a given point.
export function nNearestNeighbors(tree, point, key, n, depth, neighbors) {
  if (!depth) { depth = 0; }
  if (!neighbors) { neighbors = []; }
  let otherSubtree = null;
  const axis = depth % K;
  if (!tree) {
    return null;
  }

  const distance = Math.pow(point[0] - tree.location[key][0], 2) +
    Math.pow(point[1] - tree.location[key][1], 2) +
    Math.pow(point[2] - tree.location[key][2], 2);

  if (neighbors.length === 0 || distance < neighbors[neighbors.length - 1].distance) {
    let inserted = false;
    for (let i = 0; !inserted && i < neighbors.length; i++) {
      if (distance < neighbors[i].distance) {
        neighbors.splice(i, 0, {node: tree.location, distance});
        inserted = true;
      }
    }
    if (!inserted) {
      neighbors.push({node: tree.location, distance});
    }
    if (neighbors.length > n) {
      neighbors.pop();
    }
  }

  if (point[axis] < tree.location[key][axis]) {
    nNearestNeighbors(tree.leftChild, point, key, n, depth + 1, neighbors);
    otherSubtree = tree.rightChild;
  } else {
    nNearestNeighbors(tree.rightChild, point, key, n, depth + 1, neighbors);
    otherSubtree = tree.leftChild;
  }

  if (neighbors.length > 0 && Math.abs(tree.location[key][axis] - point[axis]) < neighbors[0].distance) {
    nNearestNeighbors(otherSubtree, point, key, n, depth + 1, neighbors);
  }

  return neighbors;
}
