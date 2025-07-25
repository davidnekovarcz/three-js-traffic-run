import React, { useMemo } from 'react'
import * as THREE from 'three'

const lawnGreen = "#67C240"
const trackColor = "#546E90"
const edgeColor = "#725F48"
const trackRadius = 225
const trackWidth = 45
const innerTrackRadius = trackRadius - trackWidth
const outerTrackRadius = trackRadius + trackWidth
const arcAngle1 = (1 / 3) * Math.PI
const deltaY = Math.sin(arcAngle1) * innerTrackRadius
const arcAngle2 = Math.asin(deltaY / outerTrackRadius)
const arcCenterX = (Math.cos(arcAngle1) * innerTrackRadius + Math.cos(arcAngle2) * outerTrackRadius) / 2
const arcAngle3 = Math.acos(arcCenterX / innerTrackRadius)
const arcAngle4 = Math.acos(arcCenterX / outerTrackRadius)

const mapWidth = 960
const mapHeight = 960 * 2

function Track() {
  const lineMarkingsTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = mapWidth
    canvas.height = mapHeight
    const context = canvas.getContext("2d")
    
    context.fillStyle = trackColor
    context.fillRect(0, 0, mapWidth, mapHeight)
    context.lineWidth = 2
    context.strokeStyle = "#E0FFFF"
    context.setLineDash([10, 14])
    
    // Left circle
    context.beginPath()
    context.arc(
      mapWidth / 2 - arcCenterX,
      mapHeight / 2,
      trackRadius,
      0,
      Math.PI * 2
    )
    context.stroke()
    
    // Right circle
    context.beginPath()
    context.arc(
      mapWidth / 2 + arcCenterX,
      mapHeight / 2,
      trackRadius,
      0,
      Math.PI * 2
    )
    context.stroke()

    // Draw finish line at the left side of the left circle
    const finishAngle = Math.PI
    const finishLineWidth = 8
    const centerX = mapWidth / 2 - arcCenterX
    const centerY = mapHeight / 2
    const rInner = innerTrackRadius + 20
    const rOuter = outerTrackRadius - 20
    const x1 = centerX + Math.cos(finishAngle) * rInner
    const y1 = centerY + Math.sin(finishAngle) * rInner
    const x2 = centerX + Math.cos(finishAngle) * rOuter
    const y2 = centerY + Math.sin(finishAngle) * rOuter
    
    context.save()
    context.globalAlpha = 0.7
    context.strokeStyle = '#fff'
    context.lineWidth = finishLineWidth
    context.setLineDash([16, 16])
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
    context.setLineDash([])
    context.restore()

    return new THREE.CanvasTexture(canvas)
  }, [])

  const curbsTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = mapWidth
    canvas.height = mapHeight
    const context = canvas.getContext("2d")
    
    context.fillStyle = lawnGreen
    context.fillRect(0, 0, mapWidth, mapHeight)
    
    // Extra big
    context.lineWidth = 65
    context.strokeStyle = "#A2FF75"
    context.beginPath()
    context.arc(
      mapWidth / 2 - arcCenterX,
      mapHeight / 2,
      innerTrackRadius,
      arcAngle1,
      -arcAngle1
    )
    context.arc(
      mapWidth / 2 + arcCenterX,
      mapHeight / 2,
      outerTrackRadius,
      Math.PI + arcAngle2,
      Math.PI - arcAngle2,
      true
    )
    context.stroke()
    
    context.beginPath()
    context.arc(
      mapWidth / 2 + arcCenterX,
      mapHeight / 2,
      innerTrackRadius,
      Math.PI + arcAngle1,
      Math.PI - arcAngle1
    )
    context.arc(
      mapWidth / 2 - arcCenterX,
      mapHeight / 2,
      outerTrackRadius,
      arcAngle2,
      -arcAngle2,
      true
    )
    context.stroke()
    
    // Extra small
    context.lineWidth = 60
    context.strokeStyle = lawnGreen
    context.beginPath()
    context.arc(
      mapWidth / 2 - arcCenterX,
      mapHeight / 2,
      innerTrackRadius,
      arcAngle1,
      -arcAngle1
    )
    context.arc(
      mapWidth / 2 + arcCenterX,
      mapHeight / 2,
      outerTrackRadius,
      Math.PI + arcAngle2,
      Math.PI - arcAngle2,
      true
    )
    context.arc(
      mapWidth / 2 + arcCenterX,
      mapHeight / 2,
      innerTrackRadius,
      Math.PI + arcAngle1,
      Math.PI - arcAngle1
    )
    context.arc(
      mapWidth / 2 - arcCenterX,
      mapHeight / 2,
      outerTrackRadius,
      arcAngle2,
      -arcAngle2,
      true
    )
    context.stroke()
    
    // Base
    context.lineWidth = 6
    context.strokeStyle = edgeColor
    
    // Outer circle left
    context.beginPath()
    context.arc(
      mapWidth / 2 - arcCenterX,
      mapHeight / 2,
      outerTrackRadius,
      0,
      Math.PI * 2
    )
    context.stroke()
    
    // Outer circle right
    context.beginPath()
    context.arc(
      mapWidth / 2 + arcCenterX,
      mapHeight / 2,
      outerTrackRadius,
      0,
      Math.PI * 2
    )
    context.stroke()
    
    // Inner circle left
    context.beginPath()
    context.arc(
      mapWidth / 2 - arcCenterX,
      mapHeight / 2,
      innerTrackRadius,
      0,
      Math.PI * 2
    )
    context.stroke()
    
    // Inner circle right
    context.beginPath()
    context.arc(
      mapWidth / 2 + arcCenterX,
      mapHeight / 2,
      innerTrackRadius,
      0,
      Math.PI * 2
    )
    context.stroke()
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.offset = new THREE.Vector2(0.5, 0.5)
    texture.repeat.set(1 / mapWidth, 1 / mapHeight)
    
    return texture
  }, [])

  const { islandLeft, islandMiddle, islandRight, outerField } = useMemo(() => {
    const islandLeft = new THREE.Shape()
    islandLeft.absarc(
      -arcCenterX,
      0,
      innerTrackRadius,
      arcAngle1,
      -arcAngle1,
      false
    )
    islandLeft.absarc(
      arcCenterX,
      0,
      outerTrackRadius,
      Math.PI + arcAngle2,
      Math.PI - arcAngle2,
      true
    )

    const islandMiddle = new THREE.Shape()
    islandMiddle.absarc(
      -arcCenterX,
      0,
      innerTrackRadius,
      arcAngle3,
      -arcAngle3,
      true
    )
    islandMiddle.absarc(
      arcCenterX,
      0,
      innerTrackRadius,
      Math.PI + arcAngle3,
      Math.PI - arcAngle3,
      true
    )

    const islandRight = new THREE.Shape()
    islandRight.absarc(
      arcCenterX,
      0,
      innerTrackRadius,
      Math.PI - arcAngle1,
      Math.PI + arcAngle1,
      true
    )
    islandRight.absarc(
      -arcCenterX,
      0,
      outerTrackRadius,
      -arcAngle2,
      arcAngle2,
      false
    )

    const outerField = new THREE.Shape()
    outerField.moveTo(-mapWidth / 2, -mapHeight / 2)
    outerField.lineTo(0, -mapHeight / 2)
    outerField.absarc(-arcCenterX, 0, outerTrackRadius, -arcAngle4, arcAngle4, true)
    outerField.absarc(
      arcCenterX,
      0,
      outerTrackRadius,
      Math.PI - arcAngle4,
      Math.PI + arcAngle4,
      true
    )
    outerField.lineTo(0, -mapHeight / 2)
    outerField.lineTo(mapWidth / 2, -mapHeight / 2)
    outerField.lineTo(mapWidth / 2, mapHeight / 2)
    outerField.lineTo(-mapWidth / 2, mapHeight / 2)

    return { islandLeft, islandMiddle, islandRight, outerField }
  }, [])

  return (
    <group>
      {/* Main track plane with line markings */}
      <mesh receiveShadow>
        <planeGeometry args={[mapWidth, mapHeight]} />
        <meshLambertMaterial map={lineMarkingsTexture} />
      </mesh>

      {/* Extruded islands and outer field */}
      <mesh receiveShadow>
        <extrudeGeometry 
          args={[
            [islandLeft, islandRight, islandMiddle, outerField], 
            { depth: 6, bevelEnabled: false }
          ]} 
        />
        <meshLambertMaterial 
          color={lawnGreen}
          map={curbsTexture}
        />
      </mesh>

      <Trees />
    </group>
  )
}

function Trees() {
  const treePositions = useMemo(() => {
    const arcX = arcCenterX
    return [
      [arcX * 1.3, 0], [arcX * 1.3, arcX * 1.9], [arcX * 0.8, arcX * 2], [arcX * 1.8, arcX * 2],
      [-arcX * 1, arcX * 2], [-arcX * 2, arcX * 1.8], [arcX * 0.8, -arcX * 2], [arcX * 1.8, -arcX * 2],
      [-arcX * 1, -arcX * 2], [-arcX * 2, -arcX * 1.8], [arcX * 0.6, -arcX * 2.3], [arcX * 1.5, -arcX * 2.4],
      [-arcX * 0.7, -arcX * 2.4], [-arcX * 1.5, -arcX * 1.8]
    ]
  }, [])

  return (
    <>
      {treePositions.map(([x, y], i) => (
        <Tree key={i} position={[x, y, 30]} />
      ))}
    </>
  )
}

function Tree({ position }) {
  const { trunkGeometry, leavesGeometry } = useMemo(() => {
    const height = [45, 60, 75][Math.floor(Math.random() * 3)]
    const trunkGeometry = new THREE.BoxGeometry(15, 15, 30)
    const leavesGeometry = new THREE.SphereGeometry(height, 8, 8)
    return { trunkGeometry, leavesGeometry }
  }, [])

  return (
    <group position={position}>
      <mesh geometry={trunkGeometry} position={[0, 0, 15]}>
        <meshLambertMaterial color={0x966f33} />
      </mesh>
      <mesh geometry={leavesGeometry} position={[0, 0, 30 + 15]}>
        <meshLambertMaterial color={0x228b22} />
      </mesh>
    </group>
  )
}

export default Track
export { arcCenterX }