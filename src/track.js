import {
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  ExtrudeGeometry,
  Shape,
  CanvasTexture,
  Vector2
} from 'three';

// Track and map constants
const lawnGreen = "#67C240";
const trackColor = "#546E90";
const edgeColor = "#725F48";
const trackRadius = 225;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;
const arcAngle1 = (1 / 3) * Math.PI;
const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
const arcAngle2 = Math.asin(deltaY / outerTrackRadius);
const arcCenterX =
  (Math.cos(arcAngle1) * innerTrackRadius +
    Math.cos(arcAngle2) * outerTrackRadius) /
  2;
const arcAngle3 = Math.acos(arcCenterX / innerTrackRadius);
const arcAngle4 = Math.acos(arcCenterX / outerTrackRadius);

function getLineMarkings(mapWidth, mapHeight) {
  const canvas = document.createElement("canvas");
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext("2d");
  context.fillStyle = trackColor;
  context.fillRect(0, 0, mapWidth, mapHeight);
  context.lineWidth = 2;
  context.strokeStyle = "#E0FFFF";
  context.setLineDash([10, 14]);
  // Left circle
  context.beginPath();
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    trackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();
  // Right circle
  context.beginPath();
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    trackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();

  // Draw finish line at the left side of the left circle (lap counter position)
  const finishAngle = Math.PI; // left side of the left circle
  const finishLineWidth = 8; // match middle line width
  const centerX = mapWidth / 2 - arcCenterX;
  const centerY = mapHeight / 2;
  const rInner = innerTrackRadius + 20;
  const rOuter = outerTrackRadius - 20;
  const x1 = centerX + Math.cos(finishAngle) * rInner;
  const y1 = centerY + Math.sin(finishAngle) * rInner;
  const x2 = centerX + Math.cos(finishAngle) * rOuter;
  const y2 = centerY + Math.sin(finishAngle) * rOuter;
  context.save();
  context.globalAlpha = 0.7; // semi-transparent
  context.strokeStyle = '#fff';
  context.lineWidth = finishLineWidth;
  context.setLineDash([16, 16]); // dashed, like the middle line
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.setLineDash([]); // reset dash
  context.restore();

  return new CanvasTexture(canvas);
}

function getCurbsTexture(mapWidth, mapHeight) {
  const canvas = document.createElement("canvas");
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext("2d");
  context.fillStyle = lawnGreen;
  context.fillRect(0, 0, mapWidth, mapHeight);
  // Extra big
  context.lineWidth = 65;
  context.strokeStyle = "#A2FF75";
  context.beginPath();
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    innerTrackRadius,
    arcAngle1,
    -arcAngle1
  );
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    outerTrackRadius,
    Math.PI + arcAngle2,
    Math.PI - arcAngle2,
    true
  );
  context.stroke();
  context.beginPath();
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    innerTrackRadius,
    Math.PI + arcAngle1,
    Math.PI - arcAngle1
  );
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    outerTrackRadius,
    arcAngle2,
    -arcAngle2,
    true
  );
  context.stroke();
  // Extra small
  context.lineWidth = 60;
  context.strokeStyle = lawnGreen;
  context.beginPath();
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    innerTrackRadius,
    arcAngle1,
    -arcAngle1
  );
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    outerTrackRadius,
    Math.PI + arcAngle2,
    Math.PI - arcAngle2,
    true
  );
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    innerTrackRadius,
    Math.PI + arcAngle1,
    Math.PI - arcAngle1
  );
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    outerTrackRadius,
    arcAngle2,
    -arcAngle2,
    true
  );
  context.stroke();
  // Base
  context.lineWidth = 6;
  context.strokeStyle = edgeColor;
  // Outer circle left
  context.beginPath();
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    outerTrackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();
  // Outer circle right
  context.beginPath();
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    outerTrackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();
  // Inner circle left
  context.beginPath();
  context.arc(
    mapWidth / 2 - arcCenterX,
    mapHeight / 2,
    innerTrackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();
  // Inner circle right
  context.beginPath();
  context.arc(
    mapWidth / 2 + arcCenterX,
    mapHeight / 2,
    innerTrackRadius,
    0,
    Math.PI * 2
  );
  context.stroke();
  return new CanvasTexture(canvas);
}

function getLeftIsland() {
  const islandLeft = new Shape();
  islandLeft.absarc(
    -arcCenterX,
    0,
    innerTrackRadius,
    arcAngle1,
    -arcAngle1,
    false
  );
  islandLeft.absarc(
    arcCenterX,
    0,
    outerTrackRadius,
    Math.PI + arcAngle2,
    Math.PI - arcAngle2,
    true
  );
  return islandLeft;
}
function getMiddleIsland() {
  const islandMiddle = new Shape();
  islandMiddle.absarc(
    -arcCenterX,
    0,
    innerTrackRadius,
    arcAngle3,
    -arcAngle3,
    true
  );
  islandMiddle.absarc(
    arcCenterX,
    0,
    innerTrackRadius,
    Math.PI + arcAngle3,
    Math.PI - arcAngle3,
    true
  );
  return islandMiddle;
}
function getRightIsland() {
  const islandRight = new Shape();
  islandRight.absarc(
    arcCenterX,
    0,
    innerTrackRadius,
    Math.PI - arcAngle1,
    Math.PI + arcAngle1,
    true
  );
  islandRight.absarc(
    -arcCenterX,
    0,
    outerTrackRadius,
    -arcAngle2,
    arcAngle2,
    false
  );
  return islandRight;
}
function getOuterField(mapWidth, mapHeight) {
  const field = new Shape();
  field.moveTo(-mapWidth / 2, -mapHeight / 2);
  field.lineTo(0, -mapHeight / 2);
  field.absarc(-arcCenterX, 0, outerTrackRadius, -arcAngle4, arcAngle4, true);
  field.absarc(
    arcCenterX,
    0,
    outerTrackRadius,
    Math.PI - arcAngle4,
    Math.PI + arcAngle4,
    true
  );
  field.lineTo(0, -mapHeight / 2);
  field.lineTo(mapWidth / 2, -mapHeight / 2);
  field.lineTo(mapWidth / 2, mapHeight / 2);
  field.lineTo(-mapWidth / 2, mapHeight / 2);
  return field;
}

function renderMap(scene, mapWidth, mapHeight, config, positionScoreElement, Tree) {
  const lineMarkingsTexture = getLineMarkings(mapWidth, mapHeight);
  const planeGeometry = new PlaneGeometry(mapWidth, mapHeight);
  const planeMaterial = new MeshLambertMaterial({ map: lineMarkingsTexture });
  const plane = new Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.matrixAutoUpdate = false;
  scene.add(plane);
  // Extruded geometry with curbs
  const islandLeft = getLeftIsland();
  const islandMiddle = getMiddleIsland();
  const islandRight = getRightIsland();
  const outerField = getOuterField(mapWidth, mapHeight);
  const curbsTexture = getCurbsTexture(mapWidth, mapHeight);
  curbsTexture.offset = new Vector2(0.5, 0.5);
  curbsTexture.repeat.set(1 / mapWidth, 1 / mapHeight);
  const fieldGeometry = new ExtrudeGeometry(
    [islandLeft, islandRight, islandMiddle, outerField],
    { depth: 6, bevelEnabled: false }
  );
  const fieldMesh = new Mesh(fieldGeometry, [
    new MeshLambertMaterial({ color: !config.curbs && lawnGreen, map: config.curbs && curbsTexture }),
    new MeshLambertMaterial({ color: 0x23311c })
  ]);
  fieldMesh.receiveShadow = true;
  fieldMesh.matrixAutoUpdate = false;
  scene.add(fieldMesh);
  if (typeof positionScoreElement === 'function') positionScoreElement();
  if (config.trees && typeof Tree === 'function') {
    const arcX = arcCenterX;
    const treePositions = [
      [arcX * 1.3, 0], [arcX * 1.3, arcX * 1.9], [arcX * 0.8, arcX * 2], [arcX * 1.8, arcX * 2],
      [-arcX * 1, arcX * 2], [-arcX * 2, arcX * 1.8], [arcX * 0.8, -arcX * 2], [arcX * 1.8, -arcX * 2],
      [-arcX * 1, -arcX * 2], [-arcX * 2, -arcX * 1.8], [arcX * 0.6, -arcX * 2.3], [arcX * 1.5, -arcX * 2.4],
      [-arcX * 0.7, -arcX * 2.4], [-arcX * 1.5, -arcX * 1.8]
    ];
    for (const [x, y] of treePositions) {
      const tree = Tree();
      tree.position.x = x;
      tree.position.y = y;
      scene.add(tree);
    }
  }
}

export {
  getLineMarkings,
  getCurbsTexture,
  getLeftIsland,
  getMiddleIsland,
  getRightIsland,
  getOuterField,
  renderMap,
  trackRadius,
  trackWidth,
  innerTrackRadius,
  outerTrackRadius,
  arcCenterX
}; 