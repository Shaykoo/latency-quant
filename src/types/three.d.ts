import { Object3DNode } from "@react-three/fiber";
import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
} from "three";

// React Three Fiber's JSX namespace is `ThreeElements`.
// We need to make sure TypeScript sees these definitions in the global JSX namespace if needed,
// but usually extending ThreeElements is enough if @react-three/fiber is imported.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: Object3DNode<AmbientLight, typeof AmbientLight>;
      directionalLight: Object3DNode<DirectionalLight, typeof DirectionalLight>;
      mesh: Object3DNode<Mesh, typeof Mesh>;
      sphereGeometry: Object3DNode<SphereGeometry, typeof SphereGeometry>;
      meshStandardMaterial: Object3DNode<
        MeshStandardMaterial,
        typeof MeshStandardMaterial
      >;
    }
  }
}
