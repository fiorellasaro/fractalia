import * as THREE from "three";

export type GeometryType =
  | "cube"
  | "tetrahedron"
  | "octahedron"
  | "icosahedron"
  | "dodecahedron"
  | "freehand";

export type ArrangementType =
  | "cube"
  | "tetrahedron"
  | "octahedron"
  | "icosahedron"
  | "dodecahedron"
  | "spiral"
  | "random";

export interface FractalRuleConfig {
  keepVertices: boolean;
  keepEdges: boolean;
  keepFaces: boolean;
  keepCenter: boolean;
}

// Helper to normalize and scale vectors
const createVector = (x: number, y: number, z: number) =>
  new THREE.Vector3(x, y, z);

// Golden Ratio for Platonic Solids
const PHI = (1 + Math.sqrt(5)) / 2;

// --- GEOMETRY DEFINITIONS (Normalized to roughly radius 1) ---

const getSpiralVectors = () => {
  // Fibonacci Spiral on a Sphere
  const points = [];
  const n = 32; // Number of points
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2; // y goes from 1 to -1
    const radius = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    points.push(createVector(x, y, z));
  }

  // Treat these as "vertices"
  return { vertices: points, edges: [], faces: [] };
};

const getRandomVectors = () => {
  const points = [];
  const n = 20;
  for (let i = 0; i < n; i++) {
    // Random point in sphere
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    // const r = Math.cbrt(Math.random()); // Cubic root for uniform volume distribution (Unused for now, using surface)

    // Scale r to be mostly on surface or volume? Let's do surface for better fractal structure
    // Actually, uniform on surface is better for structure.
    // Let's stick to surface random for cleaner look.
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);

    points.push(createVector(x, y, z));
  }
  return { vertices: points, edges: [], faces: [] };
};

const getCubeVectors = () => {
  const vertices = [];
  const edges = [];
  const faces = [];

  // Vertices (8)
  for (let x of [-1, 1])
    for (let y of [-1, 1])
      for (let z of [-1, 1]) vertices.push(createVector(x, y, z));

  // Edges (12) - Midpoints
  // x-axis edges (4)
  for (let y of [-1, 1])
    for (let z of [-1, 1]) edges.push(createVector(0, y, z));
  // y-axis edges (4)
  for (let x of [-1, 1])
    for (let z of [-1, 1]) edges.push(createVector(x, 0, z));
  // z-axis edges (4)
  for (let x of [-1, 1])
    for (let y of [-1, 1]) edges.push(createVector(x, y, 0));

  // Faces (6) - Centers
  faces.push(createVector(1, 0, 0), createVector(-1, 0, 0));
  faces.push(createVector(0, 1, 0), createVector(0, -1, 0));
  faces.push(createVector(0, 0, 1), createVector(0, 0, -1));

  return { vertices, edges, faces };
};

const getTetrahedronVectors = () => {
  // Vertices of a tetrahedron inscribed in a cube
  const vertices = [
    createVector(1, 1, 1),
    createVector(1, -1, -1),
    createVector(-1, 1, -1),
    createVector(-1, -1, 1),
  ];

  const edges: THREE.Vector3[] = [];
  const faces: THREE.Vector3[] = [];

  // Edges (Midpoints of vertex pairs)
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      edges.push(
        new THREE.Vector3()
          .addVectors(vertices[i], vertices[j])
          .multiplyScalar(0.5),
      );
    }
  }

  // Faces (Centroids of vertex triplets)
  // Faces are combinations of 3 vertices
  const combinations = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
  ];

  combinations.forEach((combo) => {
    const v1 = vertices[combo[0]];
    const v2 = vertices[combo[1]];
    const v3 = vertices[combo[2]];
    const center = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);
    faces.push(center);
  });

  return { vertices, edges, faces };
};

const getOctahedronVectors = () => {
  const vertices = [
    createVector(1, 0, 0),
    createVector(-1, 0, 0),
    createVector(0, 1, 0),
    createVector(0, -1, 0),
    createVector(0, 0, 1),
    createVector(0, 0, -1),
  ];

  const edges = [];
  const faces = [];

  // Edges: Connect points on different axes
  // 12 edges
  // Logic: edge exists between any vertex on axis A and any vertex on axis B (A!=B)
  // Actually simpler: 12 edges are midpoints.
  // Edges are at (+-0.5, +-0.5, 0) and perms
  for (let i of [-0.5, 0.5]) {
    for (let j of [-0.5, 0.5]) {
      edges.push(createVector(i, j, 0));
      edges.push(createVector(i, 0, j));
      edges.push(createVector(0, i, j));
    }
  }
  // Wait, midpoints of (1,0,0) and (0,1,0) is (0.5, 0.5, 0). Correct.

  // Faces (8) - Centroids (1/3, 1/3, 1/3) etc
  for (let x of [-1, 1])
    for (let y of [-1, 1])
      for (let z of [-1, 1])
        faces.push(createVector(x, y, z).multiplyScalar(1 / 3));

  return { vertices, edges, faces };
};

const getIcosahedronVectors = () => {
  const vertices = [];
  // (0, ±1, ±PHI) cyclic permutations
  const t = PHI;

  // Group 1: (0, ±1, ±t)
  vertices.push(
    createVector(0, 1, t),
    createVector(0, 1, -t),
    createVector(0, -1, t),
    createVector(0, -1, -t),
  );
  // Group 2: (±1, ±t, 0)
  vertices.push(
    createVector(1, t, 0),
    createVector(1, -t, 0),
    createVector(-1, t, 0),
    createVector(-1, -t, 0),
  );
  // Group 3: (±t, 0, ±1)
  vertices.push(
    createVector(t, 0, 1),
    createVector(t, 0, -1),
    createVector(-t, 0, 1),
    createVector(-t, 0, -1),
  );

  // Edges and Faces are complex to calculate manually,
  // let's approximate or just support Vertices for complex shapes if simpler?
  // User asked for "add more base geometry options".
  // Let's support Vertices for sure. Edges/Faces might be too cluttered for Icosahedron?
  // Let's calculate Edges (midpoints of nearest neighbors).
  // Distance between vertices in icosahedron is 2.

  // Simple approach: Iterate all pairs, if dist ~ 2, add midpoint.
  const edges = [];
  const faces = [];

  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const dist = vertices[i].distanceTo(vertices[j]);
      if (Math.abs(dist - 2) < 0.01) {
        edges.push(
          new THREE.Vector3()
            .addVectors(vertices[i], vertices[j])
            .multiplyScalar(0.5),
        );
      }
    }
  }

  // Faces: Triplets with dist 2
  // Icosahedron has 20 faces.
  // Finding cliques of size 3 is O(N^3), N=12 is tiny.
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = j + 1; k < vertices.length; k++) {
        const d1 = vertices[i].distanceTo(vertices[j]);
        const d2 = vertices[j].distanceTo(vertices[k]);
        const d3 = vertices[k].distanceTo(vertices[i]);
        if (
          Math.abs(d1 - 2) < 0.01 &&
          Math.abs(d2 - 2) < 0.01 &&
          Math.abs(d3 - 2) < 0.01
        ) {
          faces.push(
            new THREE.Vector3()
              .add(vertices[i])
              .add(vertices[j])
              .add(vertices[k])
              .divideScalar(3),
          );
        }
      }
    }
  }

  return { vertices, edges, faces };
};

const getDodecahedronVectors = () => {
  // Dodecahedron is dual of Icosahedron.
  // Vertices of Dodecahedron are Centers of Faces of Icosahedron.
  // Let's use the Icosahedron generator to get face centers, then scale.
  const ico = getIcosahedronVectors();
  // Ico faces are unit-ish? Ico vertices magnitude is sqrt(1 + PHI^2) = sqrt(1 + 2.618) = 1.9
  // We want to normalize everything to fit in "Size".
  // Let's return the faces of Icosahedron as Vertices of Dodecahedron.

  const vertices = ico.faces; // 20 vertices

  // Now find edges/faces of Dodecahedron from its vertices.
  // Edge length of Dodecahedron?
  // Let's compute dynamically.
  // Closest neighbor distance.

  const edges: THREE.Vector3[] = [];
  const faces: THREE.Vector3[] = [];

  if (vertices.length > 0) {
    // Find min distance (edge length)
    let minD = Infinity;
    for (let i = 1; i < vertices.length; i++) {
      const d = vertices[0].distanceTo(vertices[i]);
      if (d < minD) minD = d;
    }

    // Edges
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const d = vertices[i].distanceTo(vertices[j]);
        if (Math.abs(d - minD) < 0.01) {
          edges.push(
            new THREE.Vector3()
              .addVectors(vertices[i], vertices[j])
              .multiplyScalar(0.5),
          );
        }
      }
    }

    // Faces (Pentagons). Centroids of 5 vertices?
    // Dodecahedron has 12 faces.
    // This is getting expensive to calculate on the fly recursively?
    // Actually we only calculate positions once per recursive step.
    // But finding faces from vertices is hard.
    // Dodecahedron faces are vertices of Icosahedron! (Dual)
    // So Faces of Dodecahedron = Vertices of Icosahedron.

    ico.vertices.forEach((v) => faces.push(v)); // 12 faces
  }

  return { vertices, edges, faces };
};

// --- CACHE ---
const GEOMETRY_CACHE: Record<
  GeometryType,
  { vertices: THREE.Vector3[]; edges: THREE.Vector3[]; faces: THREE.Vector3[] }
> = {
  cube: getCubeVectors(),
  tetrahedron: getTetrahedronVectors(),
  octahedron: getOctahedronVectors(),
  icosahedron: getIcosahedronVectors(),
  dodecahedron: getDodecahedronVectors(),
  freehand: getCubeVectors(), // Default to cube positions for freehand if no custom logic
};

// Map ArrangementType to geometry generator
const ARRANGEMENT_GENERATORS: Record<
  ArrangementType,
  () => {
    vertices: THREE.Vector3[];
    edges: THREE.Vector3[];
    faces: THREE.Vector3[];
  }
> = {
  cube: getCubeVectors,
  tetrahedron: getTetrahedronVectors,
  octahedron: getOctahedronVectors,
  icosahedron: getIcosahedronVectors,
  dodecahedron: getDodecahedronVectors,
  spiral: getSpiralVectors,
  random: getRandomVectors,
};

export const getFractalPositions = (
  type: GeometryType,
  rule: FractalRuleConfig,
  scale: number, // r
  arrangement?: ArrangementType,
): THREE.Vector3[] => {
  // Use arrangement if provided, otherwise default to type (if it exists in ARRANGEMENT_GENERATORS) or cube
  let geom;
  if (arrangement) {
    geom = ARRANGEMENT_GENERATORS[arrangement]
      ? ARRANGEMENT_GENERATORS[arrangement]()
      : getCubeVectors();
  } else {
    // Fallback to type if it matches an arrangement, or just use the cache
    geom = GEOMETRY_CACHE[type] || getCubeVectors();
  }

  const positions: THREE.Vector3[] = [];

  // Logic:
  // We want to place children such that they "stick" to the features.
  // If r=1, child is at 0.
  // If r -> 0, child moves to the feature location.
  // Offset = FeaturePos * (1 - scale) ?
  // Let's check Cube Corner again.
  // Parent size 2 (Radius 1). Corner at (1,1,1).
  // Child size 2*scale. Radius scale.
  // We want Child Corner to match Parent Corner.
  // Parent Corner = (1,1,1).
  // Child Center = P. Child Corner relative to P = (scale, scale, scale).
  // P + (scale, scale, scale) = (1,1,1) => P = (1-scale, 1-scale, 1-scale).
  // P = Corner * (1-scale).
  // This logic holds for all "Corners".

  // What about Edges/Faces?
  // Center of Edge.
  // P = EdgeCenter * (1-scale).
  // Does this make the child "touch" the edge?
  // For Menger (r=1/3). EdgeCenter (1, 1, 0).
  // P = (1, 1, 0) * (2/3) = (0.66, 0.66, 0).
  // Child size 1/3.
  // Child extent = 1/3.
  // Child range in X: 0.66 ± 0.33 = [0.33, 1].
  // Parent range X: [-1, 1].
  // It fits "inside".

  // So the formula `Pos = FeatureVector * (1 - scale)` generally distributes children
  // evenly "towards" the features.

  const factor = 1 - scale;

  if (rule.keepVertices) {
    geom.vertices.forEach((v) =>
      positions.push(v.clone().multiplyScalar(factor)),
    );
  }
  if (rule.keepEdges) {
    geom.edges.forEach((v) => positions.push(v.clone().multiplyScalar(factor)));
  }
  if (rule.keepFaces) {
    geom.faces.forEach((v) => positions.push(v.clone().multiplyScalar(factor)));
  }
  if (rule.keepCenter) {
    positions.push(createVector(0, 0, 0));
  }

  return positions;
};

export const getFractalStats = (
  type: GeometryType,
  rule: FractalRuleConfig,
  scale: number,
  arrangement?: ArrangementType,
) => {
  // 1. Calculate N (number of copies kept)
  // We simulate one iteration to count
  const positions = getFractalPositions(type, rule, 1, arrangement);
  const N = positions.length;

  // 2. Calculate Dimension
  // D = log(N) / log(1/scale)
  const D =
    N > 0 && scale > 0 && scale < 1 ? Math.log(N) / Math.log(1 / scale) : 0;

  // 3. Generate description of components kept
  const kept = [];
  if (rule.keepVertices) kept.push("Vertices");
  if (rule.keepEdges) kept.push("Edges");
  if (rule.keepFaces) kept.push("Faces");
  if (rule.keepCenter) kept.push("Center");

  const components =
    kept.length > 0 ? `Keeps: ${kept.join(", ")}` : "Keeps: Nothing (Empty)";

  return {
    N,
    r: scale.toFixed(3),
    D,
    name: `Custom ${type.charAt(0).toUpperCase() + type.slice(1)} Fractal`,
    components,
  };
};
