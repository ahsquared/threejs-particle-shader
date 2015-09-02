/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	(function(window){

	  var buffer = 0;

	  //Utils
	  function _extend (target, source) {
	    var a = Object.create(target);
	    Object.keys(source).map(function (prop) {
	      if(prop in a){
	        a[prop] = source[prop];
	      }
	    });
	    return a;
	  }

	  var Particles = function(renderer, scene, options){

	    options = options || {
	      pointSize: 1.0,
	      gravityFactor: 1.0,
	      textureSize: 256,
	      targetPosition: new THREE.Vector3(0.0, 0.0, 0.0)
	    };

	    var textureSize = options.textureSize;

	    var renderTargets = createRenderTargets(textureSize);

	    var shaderTextContents = {
	      velocityVertex: __webpack_require__(1),
	      velocityFragment: __webpack_require__(2),
	      positionVertex: __webpack_require__(3),
	      positionFragment: __webpack_require__(4),
	      displayVertex: __webpack_require__(5),
	      displayFragment: __webpack_require__(6),
	      randomVertex: __webpack_require__(7),
	      randomFragment: __webpack_require__(8)
	    };



	    if(options.velocityFunctionString){
	      shaderTextContents.velocityFragment = replaceBehaviour(shaderTextContents.velocityFragment, options.velocityFunctionString);
	    }

	    if(options.colorFunctionString){
	      shaderTextContents.displayFragment = replaceBehaviour(shaderTextContents.displayFragment, options.colorFunctionString);
	    }

	    var uniforms = createUniforms(renderTargets, options.targetPosition, options.pointSize, options.gravityFactor);
	    var shaderMaterials  = createShaderMaterials(shaderTextContents, uniforms);

	    var scenes = {
	      velocity: new THREE.Scene(),
	      position: new THREE.Scene(),
	      display: scene,
	      random: new THREE.Scene()
	    };

	    scenes.velocity.add(createMesh(textureSize, shaderMaterials.velocity));
	    scenes.position.add(createMesh(textureSize, shaderMaterials.position));
	    scenes.display.add(createPointCloud(textureSize, shaderMaterials.display));
	    scenes.random.add(createMesh(textureSize, shaderMaterials.random));

	    //debug
	    //scenes.display.add(createMesh(textureSize, shaderMaterials.velocity));
	    //scenes.display.add(createMesh(textureSize, shaderMaterials.position));

	    var processCamera = new THREE.OrthographicCamera(-textureSize/2, textureSize/2, textureSize/2, -textureSize/2, -1, 0);

	    //start with random values
	    renderer.render(scenes.random, processCamera, renderTargets.velocity[0]);
	    //renderer.render(scenes.random, processCamera, renderTargets.position[0]);

	    return {
	      update: function(){
	        update(renderer, scenes, processCamera, renderTargets, uniforms);
	      }
	    };
	  };

	  window.Particles = Particles;




	  var replaceBehaviour = function(shader, snippet){
	    console.log('old: ', shader);
	    var regex = /\/\*replace\*\/[^]*\/\*replace\*\//g;
	    var newShader = shader.replace(regex, snippet);
	    console.log('new: ', newShader);
	    return newShader;
	  };



	  var createRenderTargets = function(size, options){
	    return {
	      velocity: [
	        createRenderTarget(size, options),
	        createRenderTarget(size, options)
	      ],
	      position: [
	        createRenderTarget(size, options),
	        createRenderTarget(size, options)
	      ]
	    };
	  };

	  var createRenderTarget = function(size, options) {
	    options = options || {
	      format: THREE.RGBFormat,
	      generateMipmaps: false,
	      magFilter: THREE.NearestFilter,
	      minFilter: THREE.NearestFilter,
	      type: THREE.FloatType
	    };
	    return new THREE.WebGLRenderTarget(size, size, options);
	  };

	  var createUniforms = function(renderTargets, targetPosition, pointSize, gravityFactor){
	    return {
	      velocity: {
	        velTex: {type: "t", value: renderTargets.velocity[0]},
	        posTex: {type: "t", value: renderTargets.position[0]},
	        targetPosition: {type: "v3", value: targetPosition},
	        gravityFactor: {type: "f", value: gravityFactor}
	      },
	      position: {
	        velTex: {type: "t", value: renderTargets.velocity[0]},
	        posTex: {type: "t", value: renderTargets.position[0]}
	      },
	      display: {
	        pointSize: {type: "f", value: pointSize},
	        posTex: {type: "t", value: renderTargets.position[0]},
	        targetPosition: {type: "v3", value: targetPosition},
	        alpha: {type: "f", value: 0.5}
	      }
	    };
	  };

	  var createShaderMaterials = function(shaders, uniforms, displayMaterialOptions){

	    displayMaterialOptions = displayMaterialOptions || {
	      transparent: true,
	      wireframe: false,
	      blending: THREE.AdditiveBlending,
	      depthWrite: false
	    };

	    return {
	      velocity: createShaderMaterial(shaders.velocityVertex, shaders.velocityFragment, uniforms.velocity),
	      position: createShaderMaterial(shaders.positionVertex, shaders.positionFragment, uniforms.position),
	      display: createShaderMaterial(shaders.displayVertex, shaders.displayFragment, uniforms.display, displayMaterialOptions),
	      random: createShaderMaterial(shaders.randomVertex, shaders.randomFragment, null)
	    };
	  };

	  var createShaderMaterial = function(vShader, fShader, uniforms, options) {
	    options = options || {};
	    var defaults = {
	      uniforms: uniforms,
	      vertexShader: vShader,
	      fragmentShader: fShader
	    };
	    window.$.extend(defaults, options);
	    return new THREE.ShaderMaterial(defaults);
	  };

	  var createMesh = function(size, material) {
	    return new THREE.Mesh(
	      new THREE.PlaneBufferGeometry( size, size ),
	      material
	    );
	  };

	  var createPointCloud = function(size, material) {
	    var points = new THREE.Geometry();
	    for (var i = 0; i < size * size; i++) {
	      var pos = new THREE.Vector3((i % size)/size, Math.floor(i/size)/size , 0);
	      points.vertices.push(pos);
	    }
	    return new THREE.PointCloud(points, material);
	  };

	  var update = function(renderer, scenes, processCamera, renderTargets, uniforms){
	    var newBuffer = (buffer+1)%2;
	    uniforms.velocity.velTex.value = renderTargets.velocity[buffer];
	    uniforms.position.posTex.value = renderTargets.position[buffer];
	    renderer.render(scenes.velocity, processCamera, renderTargets.velocity[newBuffer]);

	    uniforms.position.velTex.value = renderTargets.velocity[newBuffer];
	    uniforms.position.posTex.value = renderTargets.position[buffer];
	    renderer.render(scenes.position, processCamera, renderTargets.position[newBuffer]);

	    uniforms.display.posTex.value = renderTargets.position[newBuffer];

	    buffer = newBuffer;
	  };

	})(window);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n}\n"

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\nuniform sampler2D velTex;\nuniform sampler2D posTex;\nuniform vec3 targetPosition;\nuniform float gravityFactor;\n\nvoid main() {\n  vec3 inVelocity = texture2D(velTex, vUv).rgb;\n  vec3 inPosition = texture2D(posTex, vUv).rgb;\n  vec3 outVelocity;\n\n  float distance = distance(targetPosition, inPosition);\n  vec3 direction = normalize(targetPosition - inPosition);\n\n  /*replace*/\n  distance = max(distance, 1.0);\n  outVelocity = inVelocity + ((direction / distance) * gravityFactor);\n  /*replace*/\n\n  gl_FragColor = vec4( outVelocity, 1.0 );\n}\n"

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n}\n"

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\nuniform sampler2D velTex;\nuniform sampler2D posTex;\n\nvoid main() {\n  vec3 velocity = texture2D(velTex, vUv).rgb;\n  vec3 pos = texture2D(posTex, vUv).rgb;\n  pos += velocity;\n  gl_FragColor = vec4( pos, 1.0 );\n}\n"

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = "uniform sampler2D posTex;\nuniform float pointSize;\nuniform vec3 targetPosition;\nvarying float dist;\n\nvoid main() {\n  vec3 pos = texture2D(posTex, position.xy).rgb;\n  dist = distance(targetPosition, pos);\n  gl_PointSize = pointSize;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n}\n"

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = "varying float dist;\nuniform float alpha;\n\nvoid main() {\n  vec4 color;\n  /*replace*/\n  float iDistance = smoothstep(0.0, 100.0, dist);\n  color = vec4(1.0-iDistance, 0.5-iDistance, iDistance-0.1, alpha);\n  /*replace*/\n  gl_FragColor = color;\n}\n"

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\n}\n"

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = "varying vec2 vUv;\n\n\nfloat rand(vec2 co){\n  return fract(sin(dot(co.xy, vec2(12.8273, 67.245))) * 53726.17623);\n}\n\nvoid main() {\n  vec3 col;\n  col.g = rand(vec2(vUv.x, vUv.y + 1.0));\n  col.b = rand(vec2(vUv.x, vUv.y + 2.0));\n  col.r = rand(vec2(vUv.xy));\n  col = col - 0.5;\n\n  gl_FragColor = vec4(col, 1.0);\n}\n"

/***/ }
/******/ ]);