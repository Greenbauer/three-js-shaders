// lens shader

import * as THREE from 'three'

const vs = `
  precision lowp float;
  varying vec2 vUv;
  varying vec3 n;
  varying vec3 vEye;
  varying vec3 e;
  varying vec2 vN;

  varying vec3 vViewPosition;

  varying vec3 vNormal; //If Not FLAT SHADED

  //common
  #define PI 3.14159
  #define PI2 6.28318
  #define RECIPROCAL_PI2 0.15915494
  #define LOG2 1.442695
  #define EPSILON 1e-6

  #define saturate(a) clamp( a, 0.0, 1.0 )
  #define whiteCompliment(a) ( 1.0 - saturate( a ) )

  vec3 transformDirection( in vec3 normal, in mat4 matrix ) {
    return normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );
  }

  vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {
  	return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );
  }
  vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
  	float distance = dot( planeNormal, point - pointOnPlane );
  	return - distance * planeNormal + point;
  }
  float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
  	return sign( dot( point - pointOnPlane, planeNormal ) );
  }
  vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
  	return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;
  }
  float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {
  	if ( decayExponent > 0.0 ) {
  	  return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );
  	}
  	return 1.0;
  }
  vec3 F_Schlick( in vec3 specularColor, in float dotLH ) {
  	// Original approximation by Christophe Schlick '94
  	//;float fresnel = pow( 1.0 - dotLH, 5.0 );
  	// Optimized variant (presented by Epic at SIGGRAPH '13)
  	float fresnel = exp2( ( -5.55437 * dotLH - 6.98316 ) * dotLH );
  	return ( 1.0 - specularColor ) * fresnel + specularColor;
  }
  float G_BlinnPhong_Implicit( /* in float dotNL, in float dotNV */ ) {
  	// geometry term is (n⋅l)(n⋅v) / 4(n⋅l)(n⋅v)
  	return 0.25;
  }
  float D_BlinnPhong( in float shininess, in float dotNH ) {
  	// factor of 1/PI in distribution term omitted
  	return ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
  }
  vec3 BRDF_BlinnPhong( in vec3 specularColor, in float shininess, in vec3 normal, in vec3 lightDir, in vec3 viewDir ) {
  	vec3 halfDir = normalize( lightDir + viewDir );
  	//float dotNL = saturate( dot( normal, lightDir ) );
  	//float dotNV = saturate( dot( normal, viewDir ) );
  	float dotNH = saturate( dot( normal, halfDir ) );
  	float dotLH = saturate( dot( lightDir, halfDir ) );
  	vec3 F = F_Schlick( specularColor, dotLH );
  	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );
  	float D = D_BlinnPhong( shininess, dotNH );
  	return F * G * D;
  }
  vec3 inputToLinear( in vec3 a ) {
  	#ifdef GAMMA_INPUT
  		return pow( a, vec3( float( GAMMA_FACTOR ) ) );
  	#else
  		return a;
  	#endif
  }
  vec3 linearToOutput( in vec3 a ) {
  	#ifdef GAMMA_OUTPUT
  		return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );
  	#else
  		return a;
  	#endif
  }
  //

  ///uv pars vertex USED FOR MAP, ENVMAP, SPECULARMAP, ALPHAMAP
  //varying vec2 vUv;
  uniform vec4 offsetRepeat;

  ///uv2 pars vertex USED FOR LIGHTMAP
  attribute vec2 uv2;
  varying vec2 vUv2;

  //envmap pars vertex USED FOR ENVMAP
  varying vec3 vReflect;
  uniform float refractionRatio;

  //lights phong pars vertex USED FOR ENVMAP
  varying vec3 vWorldPosition;

  void main() {
  	//uv vertex USED FOR MAP, SPECULARMAP, ALPHAMAP
  	vUv = uv * offsetRepeat.zw + offsetRepeat.xy;

  	//uv2 vertex USED FOR LIGHTMAP
  	vUv2 = uv2;

  	//beginnormal vertex
  	vec3 objectNormal = vec3( normal );

  	//defaultnormal vertex
  	vec3 transformedNormal = normalMatrix * objectNormal;

  	vNormal = normalize( transformedNormal ); //If Not FLAT SHADED

  	//begin vertex
  	vec3 transformed = vec3( position );

  	//project vertex
  	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
  	gl_Position = projectionMatrix * mvPosition;

  	vViewPosition = -mvPosition.xyz;

  	//worldpos vertex USED FOR ENVMAP
  	vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );

  	//lights phong vertex USED FOR ENVMAP
  	vWorldPosition = worldPosition.xyz;

  	//used for matcap
  	e = normalize( vec3( modelViewMatrix * vec4( transformed, 1.0 ) ) );
  	n = normalize( normalMatrix * normal );
  }
`;

const fs = `
  precision lowp float;
  uniform sampler2D tNormal;

  uniform sampler2D tMatCap;
  varying vec2 vUv;
  varying vec3 n;
  varying vec3 e;

  uniform vec3 diffuse;
  uniform vec3 emissive;
  uniform vec3 specular;
  uniform float shininess;

  //uniform constants
  float opacity = 1.0;

  //common
  #define PI 3.14159
  #define PI2 6.28318
  #define RECIPROCAL_PI2 0.15915494
  #define LOG2 1.442695
  #define EPSILON 1e-6

  #define saturate(a) clamp( a, 0.0, 1.0 )
  #define whiteCompliment(a) ( 1.0 - saturate( a ) )

  vec3 transformDirection( in vec3 normal, in mat4 matrix ) {
  	return normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );
  }
  // http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
  vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {
  	return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );
  }
  vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
  	float distance = dot( planeNormal, point - pointOnPlane );
  	return - distance * planeNormal + point;
  }
  float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
  	return sign( dot( point - pointOnPlane, planeNormal ) );
  }
  vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
  	return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;
  }
  float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {
  	if ( decayExponent > 0.0 ) {
  	  return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );
  	}
  	return 1.0;
  }
  vec3 F_Schlick( in vec3 specularColor, in float dotLH ) {
  	// Original approximation by Christophe Schlick '94
  	//;float fresnel = pow( 1.0 - dotLH, 5.0 );
  	// Optimized variant (presented by Epic at SIGGRAPH '13)
  	float fresnel = exp2( ( -5.55437 * dotLH - 6.98316 ) * dotLH );
  	return ( 1.0 - specularColor ) * fresnel + specularColor;
  }
  float G_BlinnPhong_Implicit( /* in float dotNL, in float dotNV */ ) {
  	// geometry term is (n⋅l)(n⋅v) / 4(n⋅l)(n⋅v)
  	return 0.25;
  }
  float D_BlinnPhong( in float shininess, in float dotNH ) {
  	// factor of 1/PI in distribution term omitted
  	return ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
  }
  vec3 BRDF_BlinnPhong( in vec3 specularColor, in float shininess, in vec3 normal, in vec3 lightDir, in vec3 viewDir ) {
  	vec3 halfDir = normalize( lightDir + viewDir );
  	//float dotNL = saturate( dot( normal, lightDir ) );
  	//float dotNV = saturate( dot( normal, viewDir ) );
  	float dotNH = saturate( dot( normal, halfDir ) );
  	float dotLH = saturate( dot( lightDir, halfDir ) );
  	vec3 F = F_Schlick( specularColor, dotLH );
  	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );
  	float D = D_BlinnPhong( shininess, dotNH );
  	return F * G * D;
  }
  vec3 inputToLinear( in vec3 a ) {
  	#ifdef GAMMA_INPUT
  		return pow( a, vec3( float( GAMMA_FACTOR ) ) );
  	#else
  		return a;
  	#endif
  }
  vec3 linearToOutput( in vec3 a ) {
  	#ifdef GAMMA_OUTPUT
  		return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );
  	#else
  		return a;
  	#endif
  }
  //

  //uv pars fragment
  //varying vec2 vUv; //USED FOR MAP, SPECULARMAP, ALPHAMAP

  //uv2 pars fragment
  varying vec2 vUv2; //USED FOR LIGHTMAP

  //map pars fragment USED FOR MAP
  uniform sampler2D map;

  //alphamap pars fragment USED FOR ALPHAMAP
  uniform sampler2D alphaMap;

  //lightmap pars fragment USED FOR LIGHTMAP
  uniform sampler2D lightMap;
  uniform float lightMapIntensity;

  //envmap pars fragment USED FOR ENVMAP
  uniform float reflectivity;
  uniform samplerCube envMap; //USED FOR ENVMAP TYPE CUBE
  uniform float flipEnvMap;
  uniform float refractionRatio;

  //lights phong pars fragment
  uniform vec3 ambientLightColor;
  varying vec3 vWorldPosition; //USED FOR ENVMAP
  varying vec3 vViewPosition;
  varying vec3 vNormal;

  //specularmap pars fragment USED FOR SPECULARMAP
  uniform sampler2D specularMap;

  void main()
  {
  	//used for matcap
  	vec3 normalTex = texture2D( tNormal, vUv * 0.000001 ).xyz * 2.0 - 1.0;
  	normalTex.xy *= 0.5,0.5; //normalScale;
  	normalTex.y *= -1.;
  	normalTex = normalize( normalTex );
  	vec3 finalNormal = normalize( n ) * normalTex;

  	vec3 r = reflect( e, normalize( finalNormal ) );
  	float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z + 1.0 ) );
  	vec2 vN = r.xy / m + .5;

  	//combines map and matcap
  	vec3 c;
      vec4 Ca = texture2D(map, vUv);
      vec4 Cb = texture2D(tMatCap, vN);
      c = (Ca.rgb * Ca.a) + (Cb.rgb * Cb.a * (1.0 - Ca.a));
  	//

  	vec3 outgoingLight = vec3( 0.0 ); // outgoing light does not have an alpha, the surface does
  	vec4 diffuseColor = vec4( diffuse, opacity );
  	vec3 totalAmbientLight = ambientLightColor;
  	vec3 totalEmissiveLight = emissive;
  	vec3 shadowMask = vec3( 1.0 );

  	//map fragment
  	vec4 texelColor = texture2D( map, vUv );
  	texelColor.xyz = inputToLinear( texelColor.xyz );
  	diffuseColor.xyz *= texelColor.xyz;

  	//alphamap fragment
  	diffuseColor.a *= texture2D( alphaMap, vUv ).g; //USED FOR ALPHAMAP

  	//specularmap fragment
  	float specularStrength;
  	vec4 texelSpecular = texture2D( specularMap, vUv ); //USED FOR SPECULARMAP
  	specularStrength = texelSpecular.r; //USED FOR SPECULARMAP

  	//normal phong fragment
  	vec3 normal = normalize( vNormal );

  	//lightmap fragment USED FOR LIGHTMAP
  	totalAmbientLight += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;

  	//lights phong fragment
  	vec3 viewDir = normalize( vViewPosition );
  	vec3 totalDiffuseLight = vec3( 0.0 );
  	vec3 totalSpecularLight = vec3( 0.0 );

  	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight + c;

  	//envmap fragment USED FOR ENVMAP
  	vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );
  	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
  	vec3 reflectVec = reflect( cameraToVertex, worldNormal ); //ENVMAP MODE REFLECTION
  	float flipNormal = 1.0;
  	vec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) ); //ENVMAP TYPE CUBE
  	envColor.xyz = inputToLinear( envColor.xyz );
  	outgoingLight += envColor.xyz * specularStrength * reflectivity; //ENVMAP BLENDING ADD

  	//linear to gamma fragment
  	outgoingLight = linearToOutput( outgoingLight );

  	//output
  	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
  }
`;

//Lens textures
const l = "Textures/Lens/CubeMap/";
const Lurls = [
  l + "posx.jpg", l + "negx.jpg",
  l + "posy.jpg", l + "negy.jpg",
  l + "posz.jpg", l + "negz.jpg"
];
const LensTexture = new THREE.CubeTextureLoader().load(Lurls);

// lens alpha maps
const LensLogoOpacity = new THREE.TextureLoader().load('Textures/Lens/Helm-Lens-Alpha-Opacity.jpg');
const LensLogoInvert = new THREE.TextureLoader().load('Textures/Lens/Helm-Lens-Alpha-Invert.jpg');
const LensLogoMap = new THREE.TextureLoader().load('Textures/Lens/Helm-Lens-Logo-Map.png');

LensLogoOpacity.minFilter = THREE.LinearFilter;
LensLogoInvert.minFilter = THREE.LinearFilter;
LensLogoMap.minFilter = THREE.LinearFilter;

// lens material
export default function(matcap) {
  return new THREE.ShaderMaterial({
    uniforms: {
      diffuse: {
        type: "c",
        value: new THREE.Color(0xeeeeee)
      },
      map: {
        type: "t",
        value: LensLogoMap
      },
      offsetRepeat: {
        type: "v4",
        value: new THREE.Vector4(0, 0, 1, 1)
      },
      lightMap: {
        type: "t",
        value: LensLogoInvert
      },
      specularMap: {
        type: "t",
        value: LensLogoInvert
      },
      alphaMap: {
        type: "t",
        value: LensLogoOpacity
      },
      envMap: {
        type: "t",
        value: LensTexture
      },
      flipEnvMap: {
        type: "f",
        value: -1
      },
      reflectivity: {
        type: "f",
        value: 0.2
      },
      tMatCap: {
        type: 't',
        value: new THREE.TextureLoader().load(`Textures/${matcap}`)
      },
      emissive: {
        type: "c",
        value: new THREE.Color(0x000000)
      },
      specular: {
        type: "c",
        value: new THREE.Color('gray')
      },
      shininess: {
        type: "f",
        value: 30
      }
    },
    vertexShader: vs,
    fragmentShader: fs,
    transparent: true
  });
}
