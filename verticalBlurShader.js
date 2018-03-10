// vertical blur shader

// based on a gaussian distribution curve

import * as THREE from 'three'

const vs = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

const fs = `
  uniform sampler2D tDiffuse;
  uniform float v;

  varying vec2 vUv;

  void main() {
    vec4 sum = vec4( 0.0 );

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.015265;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.875 * v ) ) * 0.015276;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.75 * v ) ) * 0.015287;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.625 * v ) ) * 0.015297;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.5 * v ) ) * 0.015308;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.375 * v ) ) * 0.015318;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.25 * v ) ) * 0.015327;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.125 * v ) ) * 0.015366;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.015345;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.875 * v ) ) * 0.015353;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.75 * v ) ) * 0.015362;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.625 * v ) ) * 0.015369;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.5 * v ) ) * 0.015377;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.375 * v ) ) * 0.015384;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.25 * v ) ) * 0.01539;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.125 * v ) ) * 0.015397;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.015403;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.875 * v ) ) * 0.015408;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.75 * v ) ) * 0.015413;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.625 * v ) ) * 0.015418;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.5 * v ) ) * 0.015423;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.375 * v ) ) * 0.015427;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.25 * v ) ) * 0.015431;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.125 * v ) ) * 0.015434;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.015437;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 0.875 * v ) ) * 0.01544;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 0.75 * v ) ) * 0.015442;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 0.625 * v ) ) * 0.015444;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 0.5 * v ) ) * 0.015446;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 0.375 * v ) ) * 0.015447;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 0.25 * v ) ) * 0.015448;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 0.125 * v ) ) * 0.015449;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.015449;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 0.125 * v ) ) * 0.015449;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 0.25 * v ) ) * 0.015448;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 0.375 * v ) ) * 0.015447;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 0.5 * v ) ) * 0.015446;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 0.625 * v ) ) * 0.015444;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 0.75 * v ) ) * 0.015442;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 0.875 * v ) ) * 0.01544;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.015437;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.125 * v ) ) * 0.015434;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.25 * v ) ) * 0.015431;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.375 * v ) ) * 0.015427;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.5 * v ) ) * 0.015423;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.625 * v ) ) * 0.015418;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.75 * v ) ) * 0.015413;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.875 * v ) ) * 0.015408;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.015403;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.125 * v ) ) * 0.015397;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.25 * v ) ) * 0.01539;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.375 * v ) ) * 0.015384;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.5 * v ) ) * 0.015377;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.625 * v ) ) * 0.015369;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.75 * v ) ) * 0.015362;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.875 * v ) ) * 0.015353;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.015345;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.125 * v ) ) * 0.015336;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.25 * v ) ) * 0.015327;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.375 * v ) ) * 0.015318;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.5 * v ) ) * 0.015308;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.625 * v ) ) * 0.015297;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.75 * v ) ) * 0.015287;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.875 * v ) ) * 0.015276;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.015265;

    gl_FragColor = sum;
  }
`;

export default function(length = 512.0) {

  return new THREE.ShaderMaterial({
    uniforms: {
  		tDiffuse: { type: 't', value: null },
  		v: { type: 'f', value: 1.0 / length }
  	},
    vertexShader: vs,
    fragmentShader: fs
  });
}
