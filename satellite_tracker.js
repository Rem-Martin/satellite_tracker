// URL: https://beta.observablehq.com/d/a312d1347b5779c7
// Title: Satellite ground track visualizer
// Author: rem-martin (@rem-martin)
// Version: 1879
// Runtime version: 1

const m0 = {
  id: "a312d1347b5779c7@1879",
  variables: [
    {
      inputs: ["md"],
      value: (function(md){return(
md`# Satellite ground track visualizer`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`
Ever looked at a satellite ground track on map (like [this one showing the path of the ISS](https://spotthestation.nasa.gov/tracking_map.cfm)) and been confused by the odd, wavelike shape of the path?

Satellites don't steer erratically back and forth over the globe like they might appear to on a ground track map. Doing so would require a tremendous amount of fuel (and lifting that fuel up into space would require [yet more fuel!](https://www.nasa.gov/mission_pages/station/expeditions/expedition30/tryanny.html)). In fact, they generally fly in circular orbits that require almost no steering at all to maintain. The oscillating tracks they leave on maps are the result of two facts: that cylindrical map projections make straight lines appear curved, and that while the satellite is flying in a perfect circle, the Earth is rotating under it.

Below is an animated simulation of the Suomi NPP satellite orbiting the Earth. Suomi is an Earth-observing satellite that was launched in 2011 and helped produce the famous [nighttime views of Earth from space](https://earthobservatory.nasa.gov/Features/IntotheBlack). It is being shown here in its true orbit, and its motion is calculated based on its altitude and the mass of the Earth, using [Newton's equation for gravity](https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation). The simulation is running at 500x real time; in reality Suomi takes about 101.5 minutes to complete an orbit.

As Suomi passes over the Earth, a red line is drawn to show its path. As the planet rotates, this line moves away from the current flight path of Suomi, so that by the time the satellite comes back around, it is passing over a new part of the globe.

Below the 3D visualization is a 2D visualization of exactly the same ground track, projected in _plate carrée_ (a cylindrical projection). The ground track now appears wave-shaped, due to the distortion of the projection. Notice that the satellite appears to move faster as it nears the poles in this view; in reality its speed is constant, but distances have been distorted on the 2D map.

Try adjusting the sliders to change the orbit of the satellite. You'll see the ground track change in real time on both the 3D and 2D visualizations. If you'd like a challenge, see if you can figure out the necessary parameters to put the satellite in geosynchronous orbit (where the satellite is always over the same point on the Earth, and the red line becomes a red dot).
`
)})
    },
    {
      name: "globe",
      inputs: ["renderer","scene","camera"],
      value: (function*(renderer,scene,camera)
{  
  while (true) {
    renderer.render(scene, camera);
    yield renderer.domElement;
  }
}
)
    },
    {
      name: "viewof satelliteInclination",
      inputs: ["slider"],
      value: (function(slider){return(
slider({
  min: -90,
  max: 90,
  value: -81.3,
  format: value => `${value}°`,
  description: "Orbital inclination in degrees; 0° is equatorial"
})
)})
    },
    {
      name: "satelliteInclination",
      inputs: ["Generators","viewof satelliteInclination"],
      value: (G, _) => G.input(_)
    },
    {
      name: "viewof satelliteAltitude",
      inputs: ["slider"],
      value: (function(slider){return(
slider({
  min: 300 * 1000,
  max: 35793 * 1000,
  value: 834 * 1000,
  step: 1000,
  format: value => `${Math.round(value / 1000)} km`,
  description: "Orbital altitude in kilometers above mean sea level"
})
)})
    },
    {
      name: "satelliteAltitude",
      inputs: ["Generators","viewof satelliteAltitude"],
      value: (G, _) => G.input(_)
    },
    {
      name: "viewof timeScale",
      inputs: ["slider"],
      value: (function(slider){return(
slider({
  min: 1,
  max: 1000,
  value: 500,
  step: 1,
  format: value => `${value}x`,
  description: "Simulation speed as a multiple of real time"
})
)})
    },
    {
      name: "timeScale",
      inputs: ["Generators","viewof timeScale"],
      value: (G, _) => G.input(_)
    },
    {
      name: "map",
      inputs: ["DOM","width","d3","projection","naturalEarth","groundTrack"],
      value: (function(DOM,width,d3,projection,naturalEarth,groundTrack)
{
  let canvas = this;

  if (!canvas) {
    canvas = DOM.context2d(width, width/2).canvas;
  }
  
  let context = canvas.getContext("2d");

  const path = d3.geoPath()
    .projection(projection)
    .context(context);
  
  context.drawImage(naturalEarth, 0, 0, width, width/2);

  let line = groundTrack.slice();
  const lineWidth = 1.25 + (width / 1200);
  
  if (d3.geoDistance(line[0], line[line.length - 1]) < 0.05) {
    // special case: geosynchronous orbit
    context.strokeStyle = 'rgb(255, 0, 0)';
    context.lineWidth = 2 * lineWidth;

    context.beginPath();
    path(d3.geoCircle().center(line[0]).radius(0.05)());
    context.stroke();
  } else {
    let opacity = 1.0;
    let decay = opacity / line.length;
    context.lineWidth = lineWidth;

    while (line.length > 1) {
      
      let start = line[0],
          end = line[1];

      context.strokeStyle = `rgba(255, 0, 0, ${opacity})`;

      let segment = {
        type: 'LineString',
        coordinates: [start, end],
      };

      context.beginPath(), path(segment), context.stroke();

      opacity -= decay;
      line.shift();
    }
  }
 
  return canvas;
}
)
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`
Credits:
- Earth basemap: [Natural Earth](https://www.naturalearthdata.com)
- Suomi NPP model from [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources)
- built using [d3.js](https://d3js.org/) and [three.js](https://threejs.org/)
`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`---`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`### Three.js scene stuff`
)})
    },
    {
      name: "scene",
      inputs: ["THREE","earth","orbit","light"],
      value: (function(THREE,earth,orbit,light)
{
  let scene = this;
  
  if (!scene) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#f5f5f5');
    scene.add(earth, orbit, light);
  }

  return scene;
}
)
    },
    {
      name: "renderer",
      inputs: ["THREE","width","invalidation"],
      value: (function(THREE,width,invalidation)
{
  const renderer = new THREE.WebGLRenderer({antialias: true})
    
  renderer.setSize(width, width / 2);
  renderer.setPixelRatio(devicePixelRatio);
  
  invalidation.then(() => renderer.dispose());
  
  return renderer;
}
)
    },
    {
      name: "controls",
      inputs: ["THREE","camera","renderer","scene","invalidation"],
      value: (function(THREE,camera,renderer,scene,invalidation)
{
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minDistance = 3;
  controls.maxDistance = 20;
  
  const redraw = () => renderer.render(scene, camera);
  
  controls.addEventListener("change", redraw);
  
  invalidation.then(() => {
    controls.removeEventListener("change", redraw);
    controls.dispose();
  });
  
  return controls;
}
)
    },
    {
      name: "camera",
      inputs: ["THREE"],
      value: (function(THREE)
{
  const camera = new THREE.PerspectiveCamera(30, 2, 0.1, 60);
  camera.position.set(5, 1, 2);
  return camera;
}
)
    },
    {
      name: "light",
      inputs: ["THREE"],
      value: (function(THREE)
{
  const light = new THREE.Group();
  
  const ambient = new THREE.AmbientLight("#888")
  const directional = new THREE.DirectionalLight("#aaa")
  directional.position.x = 10;
  
  light.add(ambient, directional)
  return light;
}
)
    },
    {
      name: "earth",
      inputs: ["THREE"],
      value: (function(THREE)
{
  let earth = this;
  
  if (!earth) {
    earth = new THREE.Mesh();
    earth.geometry = new THREE.SphereBufferGeometry(1, 40, 40);
    earth.rotation.y = Math.PI;
  }
  
  return earth;
}
)
    },
    {
      name: "orbit",
      inputs: ["THREE","track","satellite","satelliteInclination"],
      value: (function(THREE,track,satellite,satelliteInclination)
{
  let orbit = this;
  
  if (!orbit) {
    orbit = new THREE.Group();    
    orbit.add(track, satellite);
  }
    
  orbit.rotation.x = satelliteInclination * Math.PI / 180;
  
  return orbit;
}
)
    },
    {
      name: "track",
      inputs: ["THREE","orbitRadiusInEarthRadii"],
      value: (function(THREE,orbitRadiusInEarthRadii)
{
  let track = this; 

  if (!track) {
    track = new THREE.Line();

    track.geometry = new THREE.CircleGeometry(1, 80);
    track.geometry.vertices.shift();
    track.geometry.vertices.push(track.geometry.vertices[0]);
    track.geometry.rotateX(Math.PI / 2); // rotate geometry so default is equatorial orbit

    track.material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  }
  
  track.scale.setScalar(orbitRadiusInEarthRadii);

  return track;
}
)
    },
    {
      name: "satellite",
      inputs: ["THREE","orbitRadiusInEarthRadii"],
      value: (async function(THREE,orbitRadiusInEarthRadii)
{
  let satellite = this;
  
  if (!satellite) {
    //satellite = new THREE.Mesh();
    // satellite.geometry = new THREE.SphereGeometry(0.02, 16, 16);
    // satellite.material = new THREE.PointsMaterial({ size: 0.1, color: 0xff00ff });
    const objLoader = new THREE.OBJLoader();
    const mtlLoader = new THREE.MTLLoader();
    
    const gistUrl = "https://gist.githubusercontent.com/jake-low/ae6f79de55ca9e4612957158a1637ab0/raw/439e9c2986d9ed5a7eba66921b6c1458bf75d455/";
    
    objLoader.setPath(gistUrl);
    
    mtlLoader.setPath(gistUrl);
    mtlLoader.setResourcePath(gistUrl);

    const materials = await new Promise((resolve, reject) =>
      mtlLoader.load("NPP.mtl", resolve, () => {}, reject)
    );
    
    materials.preload();
    
    objLoader.setMaterials(materials);
    
    satellite = await new Promise((resolve, reject) =>
      objLoader.load("NPP.obj", resolve, () => {}, reject)
    );
                
    satellite.scale.setScalar(0.02);
    satellite.rotation.x = -Math.PI / 2;

  }
  
  satellite.position.x = orbitRadiusInEarthRadii;
  
  return satellite;
}
)
    },
    {
      name: "texture",
      inputs: ["THREE","map","earth"],
      value: (function(THREE,map,earth)
{
  let texture = this;
  
  if (!texture) {
    texture = new THREE.CanvasTexture(map);
    earth.material = new THREE.MeshLambertMaterial({ map: texture });
  } else {
    texture.needsUpdate = true;
  }
  
  return texture;
}
)
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`---`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`### Physics simulation stuff`
)})
    },
    {
      name: "G",
      value: (function(){return(
6.67191e-11
)})
    },
    {
      name: "earthMass",
      value: (function(){return(
5.9721986e24
)})
    },
    {
      name: "earthRadius",
      value: (function(){return(
6371 * 1000
)})
    },
    {
      name: "earthAngularVelocity",
      value: (function(){return(
(2 * Math.PI) / (23.934461223 /* sidereal day */ * 60 * 60)
)})
    },
    {
      name: "satelliteVelocity",
      inputs: ["G","earthMass","earthRadius","satelliteAltitude"],
      value: (function(G,earthMass,earthRadius,satelliteAltitude){return(
Math.sqrt(G * earthMass / (earthRadius + satelliteAltitude))
)})
    },
    {
      name: "satelliteAngularVelocity",
      inputs: ["satelliteVelocity","earthRadius","satelliteAltitude"],
      value: (function(satelliteVelocity,earthRadius,satelliteAltitude){return(
satelliteVelocity / (earthRadius + satelliteAltitude)
)})
    },
    {
      name: "orbitRadiusInEarthRadii",
      inputs: ["earthRadius","satelliteAltitude"],
      value: (function(earthRadius,satelliteAltitude){return(
(earthRadius + satelliteAltitude) / earthRadius
)})
    },
    {
      name: "simulate",
      inputs: ["Promises","timeScale","earth","earthAngularVelocity","orbit","satelliteAngularVelocity"],
      value: (async function*(Promises,timeScale,earth,earthAngularVelocity,orbit,satelliteAngularVelocity)
{
  let lastUpdated = performance.now();
  
  while (true) {
    await Promises.tick(1000 / 60);
    const currentTime = performance.now();
    
    const simulatedTimeDelta = (currentTime - lastUpdated) * timeScale / 1000;

    // simulate rotation of the Earth
    earth.rotation.y += earthAngularVelocity * simulatedTimeDelta;
    
    // rotate satellite
    orbit.rotation.y += satelliteAngularVelocity * simulatedTimeDelta;
    
    lastUpdated = currentTime;
    yield;
  }
}
)
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`---`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`### Map imagery and projection`
)})
    },
    {
      name: "naturalEarth",
      inputs: ["d3"],
      value: (function(d3){return(
d3.image(
  "https://gist.githubusercontent.com/jake-low/d519e00853b15e9cec391c3dab58e77f/raw/6e796038e4f34524059997f8e1f1c42ea289d805/ne1-small.png",
  {crossOrigin: "anonymous"})
)})
    },
    {
      name: "projection",
      inputs: ["d3","width"],
      value: (function(d3,width){return(
d3.geoEquirectangular()
  .fitSize([width, width/2], { type: 'Sphere' })
  .precision(0.1)
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`### Ground track calculation`
)})
    },
    {
      name: "groundTrack",
      inputs: ["satellite","orbit","THREE","satelliteAngularVelocity","earth","earthAngularVelocity"],
      value: (function*(satellite,orbit,THREE,satelliteAngularVelocity,earth,earthAngularVelocity)
{
  const numPoints = 100, timeBetweenPoints = -300;

  while (true) {
    const profile = Math.random() > 0.99;
    if (profile) {
      console.time("groundTrack");
    }
    const points = [];
    
    // get cartesian coordinates of satellite in orbital reference frame
    let currentPosition = satellite.getWorldPosition();
    let orbitNormal = orbit.localToWorld(new THREE.Vector3(0, 1, 0));

    for (let i = 0; i < numPoints; i++) {
      // convert to spherical coordinates
      let timeOffsetPosition = currentPosition.clone();
      
      // rotate the position about the normal vector to the orbital plane, to
      // account for the movement of the satellite between the current time and
      // the offset time.
      timeOffsetPosition.applyAxisAngle(
        orbitNormal,
        satelliteAngularVelocity * i * timeBetweenPoints);
      
      // convert from orbital frame to Earth frame (which is rotating about its Y axis)
      let timeOffsetEarthFramePosition = earth.worldToLocal(timeOffsetPosition);
      
      // correct for the amout of time Earth has/will have rotated during timeOffset
      timeOffsetEarthFramePosition.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -earthAngularVelocity * i * timeBetweenPoints);

      // convert back to spherical one more time so we can get theta and phi
      let sphericalTimeOffsetEarthFramePosition = new THREE.Spherical();
      sphericalTimeOffsetEarthFramePosition.setFromVector3(timeOffsetEarthFramePosition);
      sphericalTimeOffsetEarthFramePosition.makeSafe();

      // convert to degrees
      let theta = sphericalTimeOffsetEarthFramePosition.theta * 180 / Math.PI,
          phi = sphericalTimeOffsetEarthFramePosition.phi * 180 / Math.PI;

      // convert theta and phi to longitude and latitude
      let longitude = (theta - 90),
          latitude = (90 - phi);

      points.push([longitude, latitude]);
    }
    
    if (profile) {
      console.timeEnd("groundTrack");
    }
    
    yield points;
  }
}
)
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`---`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`### Miscellaneous`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`
Slider inputs taken from [@jashkenas/inputs](/@jashkenas/inputs) and modified very slightly to support richer formatting.
`
)})
    },
    {
      name: "input",
      inputs: ["html"],
      value: (function(html){return(
function input(config) {
  let {form, type = "text", attributes = {}, action, getValue, title, description, format, submit, options} = config;
  if (!form) form = html`<form>
	<input name=input type=${type} />
  </form>`;
  const input = form.input;
  Object.keys(attributes).forEach(key => {
    const val = attributes[key];
    if (val != null) input.setAttribute(key, val);
  });
  if (submit) form.append(html`<input name=submit type=submit style="margin: 0 0.75em" value="${typeof submit == 'string' ? submit : 'Submit'}" />`);
  form.append(html`<output name=output style="font: 14px Menlo, Consolas, monospace; margin-left: 0.5em;"></output>`);
  if (title) form.prepend(html`<div style="font: 700 0.9rem sans-serif;">${title}</div>`);
  if (description) form.append(html`<div style="font-size: 0.85rem; font-style: italic;">${description}</div>`);
  if (action) {
    action(form);
  } else {
    const verb = submit ? "onsubmit" : type == "button" ? "onclick" : type == "checkbox" || type == "radio" ? "onchange" : "oninput";
    form[verb] = (e) => {
      e && e.preventDefault();
      const value = getValue ? getValue(input) : input.value;
      if (form.output) form.output.value = format ? format(value) : value;
      form.value = value;
      if (verb !== "oninput") form.dispatchEvent(new CustomEvent("input"));
    };
    if (verb !== "oninput") input.oninput = e => e && e.stopPropagation() && e.preventDefault();
    if (verb !== "onsubmit") form.onsubmit = (e) => e && e.preventDefault();
    form[verb]();
  }
  return form;
}
)})
    },
    {
      name: "slider",
      inputs: ["input"],
      value: (function(input){return(
function slider(config = {}) {
  let {value, min = 0, max = 1, step = "any", precision = 2, title, description, format, submit} = config;
  if (typeof config == "number") value = config;
  if (value == null) value = (max + min) / 2;
  precision = Math.pow(10, precision);
  return input({
    type: "range", title, description, submit, format,
    attributes: {min, max, step, value},
    getValue: input => Math.round(input.valueAsNumber * precision) / precision
  });
}
)})
    },
    {
      name: "stylesheet",
      inputs: ["html"],
      value: (function(html){return(
html`
<em>(restyle inputs so they take up less vertical space on mobile)</em>
<style>
input[type="range"] {
  max-width: 70vw;
}
</style>
`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`
Dependencies: d3.js and Three.js
`
)})
    },
    {
      name: "THREE",
      inputs: ["require"],
      value: (async function(require)
{
  const THREE = window.THREE = await require("three@0.97/build/three.min.js");
  await require("three@0.97/examples/js/controls/OrbitControls.js").catch(() => {});
  await require("three@0.97/examples/js/loaders/OBJLoader.js").catch(() => {});
  await require("three@0.97/examples/js/loaders/MTLLoader.js").catch(() => {});
  return THREE;
}
)
    },
    {
      name: "d3",
      inputs: ["require"],
      value: (function(require){return(
require("d3@5")
)})
    }
  ]
};

const notebook = {
  id: "a312d1347b5779c7@1879",
  modules: [m0]
};

export default notebook;
