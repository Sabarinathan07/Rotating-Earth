import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
var container, controls, camera, renderer, scene, light,
    rotationSpeed = 0.1,
    clock = new THREE.Clock(),
    WIDTH = window.innerWidth - -1000,
    HEIGHT = window.innerHeight - -1000;

//cam vars
var angle = 45,
    aspect = WIDTH / HEIGHT,
    near = 0.1,
    far = 10000;

//mesh vars
var earthMesh, Atmos, AtmosMat;

container = document.createElement('div');
document.body.appendChild(container);

//cam
camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
camera.position.set(1380, -17, 394);

//scene
scene = new THREE.Scene();
camera.lookAt(scene.position);


//light          
light = new THREE.SpotLight(0xFFFFFF, 1, 0, Math.PI / 2, 1);
light.position.set(4000, 4000, 1500);
light.target.position.set(1000, 3800, 1000);
light.castShadow = true;
//light.shadowCameraNear = 1;
//light.shadowCameraFar = 10000;
//light.shadowCameraFov = 50;

scene.add(light);

//EARTH
var earthGeo = new THREE.SphereGeometry(200, 400, 400),
    earthMat = new THREE.MeshPhongMaterial();
earthMesh = new THREE.Mesh(earthGeo, earthMat);
earthMesh.position.set(0, 0, 0);


earthMesh.rotation.y = 5;
scene.add(earthMesh);

var textureLoader = new THREE.TextureLoader();
earthMat.map = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/earthmap.jpg');
// Bump
earthMat.bumpMap = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/bump-map.jpg');
earthMat.bumpScale = 8;
// Specular
earthMat.specularMap = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/earthspec1k.jpg');
earthMat.specular = new THREE.Color('#2e2e2e');


earthMesh.castShadow = true;
earthMesh.receiveShadow = true;
camera.position.set(1380, -17, 394);
camera.lookAt(earthMesh.position)

//Atmosphere
AtmosMat = new THREE.ShaderMaterial({
    uniforms:{
      "c": { type: "f", value: 0.1 },
      "p": { type: "f", value: 5.2},
      glowColor: { type: "c", value: new THREE.Color(0x00dbdb)},
      viewVector: { type: "v3", value: camera.position}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  
  Atmos = new THREE.Mesh(earthGeo, AtmosMat);
  Atmos.position.set(0, 0, 0); // Set the position using set() method
  Atmos.scale.multiplyScalar(1.2);
  scene.add(Atmos);

//STARS
var starGeo = new THREE.SphereGeometry(3000, 10, 100),
    starMat = new THREE.MeshBasicMaterial();
starMat.map = textureLoader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/star-field.png');
starMat.side = THREE.BackSide;

var starMesh = new THREE.Mesh(starGeo, starMat);

scene.add(starMesh);


//renderer
renderer = new THREE.WebGLRenderer({ antialiasing: true });
renderer.setSize(WIDTH, HEIGHT);

container.appendChild(renderer.domElement);


//controls
var controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', render);


function animate() {

    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    var delta = clock.getDelta();
    var directionToEarth = earthMesh.position.clone().sub(camera.position).normalize();
    var angleToLight = directionToEarth.angleTo(light.position.clone().normalize());
    var angleInDegrees = THREE.MathUtils.radToDeg(angleToLight);
    var brightnessFactor = 1.0 - angleInDegrees / 90;
    brightnessFactor = THREE.MathUtils.clamp(brightnessFactor, 0, 1);
    var brightnessMultiplier = 1.0 + brightnessFactor * 0.5; // Adjust 0.5 as needed
    earthMat.specular = new THREE.Color('#2e2e2e').multiplyScalar(brightnessMultiplier);
    earthMesh.rotation.y += rotationSpeed * delta;
    renderer.clear();
    renderer.render(scene, camera);
}

animate();