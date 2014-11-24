var world = require('three-world'),
    THREE = require('three'),
    geometry = new THREE.CubeGeometry(10, 1, 10),
    material = new THREE.MeshNormalMaterial(); //{ color: 0xff0000 }),
    center   = new THREE.Object3D(),
    meshes   = [], camera = null;

world.init({ camDistance: 150, renderCallback: onRendered });
camera = world.getCamera();
camera.position.set(0, 80, 350);

center.position.set(0, 0, -75);
center.add(camera);
world.add(center);

window.meshes = meshes;

for(var i=0;i<100;i++) {
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(15 * (-5 + (i % 10)), 0, -15 * Math.floor(i/10), 0);
  meshes.push(mesh);
  world.add(mesh);
}
function onRendered() {
  center.rotation.y += 0.01;
}

world.startRenderLoop();

// Audio stuff...

var context = new AudioContext(),
    source = context.createBufferSource(),
    analyser = context.createAnalyser();

analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 2048;

function updateSpectrum() {
  var array =  new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(array);
  for(var i=0;i<100;i++) {
    meshes[i].scale.y = 1 + (array[i * 10]);
    meshes[i].position.y = meshes[i].scale.y / 2;
  }
  requestAnimationFrame(updateSpectrum);
};

var xhr = new XMLHttpRequest();
xhr.responseType = 'arraybuffer';
xhr.open('GET', 'track.ogg', true);
xhr.onload = function() {
  context.decodeAudioData(this.response, function(buffer) {
    source.connect(analyser);
    analyser.connect(context.destination);
    source.buffer = buffer;
    source.start(0);
    updateSpectrum();
  });
}
xhr.send();
