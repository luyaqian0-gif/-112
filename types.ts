import { Mesh, Vector3, Euler } from 'three';

export enum AppMode {
  TREE = 'TREE',
  SCATTER = 'SCATTER',
  FOCUS = 'FOCUS'
}

export interface ParticleData {
  mesh: Mesh;
  velocity: Vector3; // For scatter rotation
  basePosition: Vector3; // Original position logic
  type: 'DECORATION' | 'DUST' | 'PHOTO';
  isFloating: boolean;
}

export interface HandGesture {
  name: string;
  score: number;
}
