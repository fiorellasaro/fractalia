import React, { useMemo } from "react";

interface MengerSpongeProps {
  size: number;
  depth: number;
  color: string;
  metalness: number;
  roughness: number;
  isWireframe: boolean;
}

const MengerSponge: React.FC<MengerSpongeProps> = React.memo(
  ({ size, depth, color, metalness, roughness, isWireframe }) => {
    if (depth <= 0) {
      return (
        <mesh>
          <boxGeometry args={[size, size, size]} />
          <meshStandardMaterial 
            color={color} 
            roughness={roughness} 
            metalness={metalness} 
            wireframe={isWireframe}
          />
        </mesh>
      );
    }

    const newSize = size / 3;
    
    // Memoize the children generation to avoid unnecessary recalculations
    const children = useMemo(() => {
      const cubes = [];
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            // Menger sponge condition: remove center of cube and center of faces
            // This corresponds to excluding blocks where 2 or more coordinates are 0
            const zeros =
              (x === 0 ? 1 : 0) + (y === 0 ? 1 : 0) + (z === 0 ? 1 : 0);
            
            if (zeros < 2) {
              cubes.push(
                <group
                  position={[x * newSize, y * newSize, z * newSize]}
                  key={`${x}-${y}-${z}`}
                >
                  <MengerSponge
                    size={newSize}
                    depth={depth - 1}
                    color={color}
                    metalness={metalness}
                    roughness={roughness}
                    isWireframe={isWireframe}
                  />
                </group>,
              );
            }
          }
        }
      }
      return cubes;
    }, [depth, newSize, color, metalness, roughness, isWireframe]);

    return <group>{children}</group>;
  },
);

export default MengerSponge;
