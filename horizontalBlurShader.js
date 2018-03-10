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
  uniform float h;

  varying vec2 vUv;

  void main() {
    vec4 sum = vec4( 0.0 );

    sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.015265;
    sum += texture2D( tDiffuse, vec2( vUv.x - 3.875 * h, vUv.y ) ) * 0.015276;
    sum += texture2D( tDiffuse, vec2( vUv.x - 3.75 * h, vUv.y ) ) * 0.015287;
    sum += texture2D( tDiffuse, vec2( vUv.x - 3.625 * h, vUv.y ) ) * 0.015297;

    sum += texture2D( tDiffuse, vec2( vUv.x - 3.5 * h, vUv.y ) ) * 0.015308;
    sum += texture2D( tDiffuse, vec2( vUv.x - 3.375 * h, vUv.y ) ) * 0.015318;
    sum += texture2D( tDiffuse, vec2( vUv.x - 3.25 * h, vUv.y ) ) * 0.015327;
    sum += texture2D( tDiffuse, vec2( vUv.x - 3.125 * h, vUv.y ) ) * 0.015366;

    sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.015345;
    sum += texture2D( tDiffuse, vec2( vUv.x - 2.875 * h, vUv.y ) ) * 0.015353;
    sum += texture2D( tDiffuse, vec2( vUv.x - 2.75 * h, vUv.y ) ) * 0.015362;
    sum += texture2D( tDiffuse, vec2( vUv.x - 2.625 * h, vUv.y ) ) * 0.015369;

    sum += texture2D( tDiffuse, vec2( vUv.x - 2.5 * h, vUv.y ) ) * 0.015377;
    sum += texture2D( tDiffuse, vec2( vUv.x - 2.375 * h, vUv.y ) ) * 0.015384;
    sum += texture2D( tDiffuse, vec2( vUv.x - 2.25 * h, vUv.y ) ) * 0.01539;
    sum += texture2D( tDiffuse, vec2( vUv.x - 2.125 * h, vUv.y ) ) * 0.015397;

    sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.015403;
    sum += texture2D( tDiffuse, vec2( vUv.x - 1.875 * h, vUv.y ) ) * 0.015408;
    sum += texture2D( tDiffuse, vec2( vUv.x - 1.75 * h, vUv.y ) ) * 0.015413;
    sum += texture2D( tDiffuse, vec2( vUv.x - 1.625 * h, vUv.y ) ) * 0.015418;

    sum += texture2D( tDiffuse, vec2( vUv.x - 1.5 * h, vUv.y ) ) * 0.015423;
    sum += texture2D( tDiffuse, vec2( vUv.x - 1.375 * h, vUv.y ) ) * 0.015427;
    sum += texture2D( tDiffuse, vec2( vUv.x - 1.25 * h, vUv.y ) ) * 0.015431;
    sum += texture2D( tDiffuse, vec2( vUv.x - 1.125 * h, vUv.y ) ) * 0.015434;

    sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.015437;
    sum += texture2D( tDiffuse, vec2( vUv.x - 0.875 * h, vUv.y ) ) * 0.01544;
    sum += texture2D( tDiffuse, vec2( vUv.x - 0.75 * h, vUv.y ) ) * 0.015442;
    sum += texture2D( tDiffuse, vec2( vUv.x - 0.625 * h, vUv.y ) ) * 0.015444;

    sum += texture2D( tDiffuse, vec2( vUv.x - 0.5 * h, vUv.y ) ) * 0.015446;
    sum += texture2D( tDiffuse, vec2( vUv.x - 0.375 * h, vUv.y ) ) * 0.015447;
    sum += texture2D( tDiffuse, vec2( vUv.x - 0.25 * h, vUv.y ) ) * 0.015448;
    sum += texture2D( tDiffuse, vec2( vUv.x - 0.125 * h, vUv.y ) ) * 0.015449;

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.015449;

    sum += texture2D( tDiffuse, vec2( vUv.x + 0.125 * h, vUv.y ) ) * 0.015449;
    sum += texture2D( tDiffuse, vec2( vUv.x + 0.25 * h, vUv.y ) ) * 0.015448;
    sum += texture2D( tDiffuse, vec2( vUv.x + 0.375 * h, vUv.y ) ) * 0.015447;
    sum += texture2D( tDiffuse, vec2( vUv.x + 0.5 * h, vUv.y ) ) * 0.015446;

    sum += texture2D( tDiffuse, vec2( vUv.x + 0.625 * h, vUv.y ) ) * 0.015444;
    sum += texture2D( tDiffuse, vec2( vUv.x + 0.75 * h, vUv.y ) ) * 0.015442;
    sum += texture2D( tDiffuse, vec2( vUv.x + 0.875 * h, vUv.y ) ) * 0.01544;
    sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.015437;

    sum += texture2D( tDiffuse, vec2( vUv.x + 1.125 * h, vUv.y ) ) * 0.015434;
    sum += texture2D( tDiffuse, vec2( vUv.x + 1.25 * h, vUv.y ) ) * 0.015431;
    sum += texture2D( tDiffuse, vec2( vUv.x + 1.375 * h, vUv.y ) ) * 0.015427;
    sum += texture2D( tDiffuse, vec2( vUv.x + 1.5 * h, vUv.y ) ) * 0.015423;

    sum += texture2D( tDiffuse, vec2( vUv.x + 1.625 * h, vUv.y ) ) * 0.015418;
    sum += texture2D( tDiffuse, vec2( vUv.x + 1.75 * h, vUv.y ) ) * 0.015413;
    sum += texture2D( tDiffuse, vec2( vUv.x + 1.875 * h, vUv.y ) ) * 0.015408;
    sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.015403;

    sum += texture2D( tDiffuse, vec2( vUv.x + 2.125 * h, vUv.y ) ) * 0.015397;
    sum += texture2D( tDiffuse, vec2( vUv.x + 2.25 * h, vUv.y ) ) * 0.01539;
    sum += texture2D( tDiffuse, vec2( vUv.x + 2.375 * h, vUv.y ) ) * 0.015384;
    sum += texture2D( tDiffuse, vec2( vUv.x + 2.5 * h, vUv.y ) ) * 0.015377;

    sum += texture2D( tDiffuse, vec2( vUv.x + 2.625 * h, vUv.y ) ) * 0.015369;
    sum += texture2D( tDiffuse, vec2( vUv.x + 2.75 * h, vUv.y ) ) * 0.015362;
    sum += texture2D( tDiffuse, vec2( vUv.x + 2.875 * h, vUv.y ) ) * 0.015353;
    sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.015345;

    sum += texture2D( tDiffuse, vec2( vUv.x + 3.125 * h, vUv.y ) ) * 0.015336;
    sum += texture2D( tDiffuse, vec2( vUv.x + 3.25 * h, vUv.y ) ) * 0.015327;
    sum += texture2D( tDiffuse, vec2( vUv.x + 3.375 * h, vUv.y ) ) * 0.015318;
    sum += texture2D( tDiffuse, vec2( vUv.x + 3.5 * h, vUv.y ) ) * 0.015308;

    sum += texture2D( tDiffuse, vec2( vUv.x + 3.625 * h, vUv.y ) ) * 0.015297;
    sum += texture2D( tDiffuse, vec2( vUv.x + 3.75 * h, vUv.y ) ) * 0.015287;
    sum += texture2D( tDiffuse, vec2( vUv.x + 3.875 * h, vUv.y ) ) * 0.015276;
    sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.015265;

    gl_FragColor = sum;
  }
`;

export default function(length = 512.0) {

  return new THREE.ShaderMaterial({
    uniforms: {
  		tDiffuse: { type: 't', value: null },
  		h: { type: 'f', value: 1.0 / length }
  	},
    vertexShader: vs,
    fragmentShader: fs
  });
}
