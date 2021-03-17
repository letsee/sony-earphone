
// 3D
let scene,
		camera,
		renderer,
		toystory,
		mainMesh,
		secondMesh;

// Declare variables
const SWIPE_AREA = $('#swipe-area');
const MODEL_1 = $('#model-1');
const MODEL_2 = $('#model-2');
const MODEL_3 = $('#model-3');
const BUTTON_ICON_1 = $('#bt-icon-1');
const BUTTON_ICON_2 = $('#bt-icon-2');
const BUTTON_ICON_3 = $('#bt-icon-3');

let object, mixer1, mixer2;
let action1, action2;
let light1, directionalLight, spotLight;
let clock = new THREE.Clock();
// let world = new THREE.Object3D();
let elementArray = [];

// This plays model's animation
let flag1 = true;
let flag2= false;
let flag3= false;

let overviewAnimId, rotateModelId, earpodAnimId;
let isOverviewClicked = true;
let isEarpodClicked = false;

let mainURL = 'https://intra.letsee.io/3D-model/fbx/sony/';
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (item, loaded, total) => console.log(item, loaded, total);

// Instantiate a fbxLoader
let fbxLoader = new THREE.FBXLoader();

/**
 * Initialize 3D world.
 */
function initWorld() {

	initScene();
	proceedModel();

}

/**
 * Initialze Scene.
 */
function initScene() {

	// 1. Adding lights
	let dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
	dirLight.position.set(-0.5, 0.5, 0.866);
	dirLight.castShadow = false;
	dirLight.shadow.mapSize = new THREE.Vector2(512, 512);
	scene.add(dirLight);

	let pmremGenerator = new THREE.PMREMGenerator( renderer );
	pmremGenerator.compileEquirectangularShader();

	// 2. Set background for scene as image
	new THREE.RGBELoader()
	.setDataType( THREE.UnsignedByteType )
	.setPath( './resources/textures/' )
	.load( 'royal_esplanade_1k.hdr', function ( texture ) {

		let envMap = pmremGenerator.fromEquirectangular( texture ).texture;

		// scene.background = envMap;
		scene.environment = envMap;

		texture.dispose();
		pmremGenerator.dispose();

	});

	// 3. Set light effects for renderer
	renderer.toneMappingExposure     = 1;
	renderer.toneMapping             = 0;
	renderer.gammaFactor             = 2;
	renderer.outputEncoding          = THREE.sRGBEncoding;
	renderer.physicallyCorrectLights = true;
	renderer.setPixelRatio( window.devicePixelRatio );
}

/**
 * 1. Load model.
 * 2. Add model into Entity.
 * 3. Add Entity into Scene.
 */
function proceedModel() {

	letsee.addTarget('https://developer.letsee.io/api-tm/target-manager/target-uid/6051e01cb30426a32a7be173').then(entity => {
		toystory = entity;

		// 1. Load Sony model
		loadMainModel()
		.then(model => {
			console.warn(`Model ${model.name} loaded completed!`);
			mainMesh = model;

			// 2.Add mesh into entity
			toystory.add(mainMesh);

			// 3. Add entity to scene
			scene.add(toystory);

			if (mainMesh) {

				// Load second model
				loadSecondModel().then(_mesh => {
					console.warn(`Model ${_mesh.name} loaded completed!`);
					secondMesh = _mesh;
					toystory.add(secondMesh);
				});
			}
		});

		// Render all
		renderAll().then(() => {});
	});
}

/**
 * Render all.
 * @returns {Promise<void>}
 */
const renderAll = async function() {
	requestAnimationFrame(renderAll);

	window.camera = letsee.threeRenderer().getDeviceCamera();

	renderer.render(scene, window.camera);
	await letsee.threeRenderer().update();
};

/**
 * Load main model.
 * @returns {Promise<unknown>}
 */
function loadMainModel() {
	return new Promise(resolve => {

		fbxLoader.load( mainURL + 'Sony_01_7.fbx' , function(obj) {

			obj.type ='sony';
			obj.name ='Sony_01';
			obj.position.y = -80;
			obj.rotation.y = 24;
			obj.scale.setScalar(30);

			// Create custom animation clips
			if (obj.animations.length > 0) {
				mixer1 = new THREE.AnimationMixer( obj );
				action1 = mixer1.clipAction( obj.animations[0]);
				action1.play();
			}

			resolve(obj);
		}, onProgress, onError);
	})
}

/**
 * Load second model.
 * @returns {Promise<unknown>}
 */
function loadSecondModel() {
	return new Promise(resolve => {

		fbxLoader.load( mainURL + 'Sony_earphon_V5_0103_10.fbx' , function(obj) {

			obj.type ='sony';
			obj.name ='Sony_02';
			obj.position.y = -250;
			obj.position.x = 10;
			obj.rotation.y = -315;
			obj.scale.setScalar(50);
			obj.visible = false;

			// Create custom animation clips
			if (obj.animations.length > 0) {
				mixer2 = new THREE.AnimationMixer( obj );
				action2 = mixer2.clipAction( obj.animations[0]);
				action2.play();
			}

			resolve(obj);
		}, onProgress, onError);
	})
}

/**
 * Play animation of main model - overview.
 */
function overviewAnimation() {
	overviewAnimId = requestAnimationFrame(overviewAnimation);

	let delta = clock.getDelta();
	if ( mixer1 ) mixer1.update( delta );

}

/**
 * Play Earpods animation.
 */
function playEarpodAnim() {
	earpodAnimId= requestAnimationFrame( playEarpodAnim );

	let delta = clock.getDelta();
	if ( mixer2 ) mixer2.update( delta );
}

/**
 * Rotate current model.
 */
function rotateCurrentModel() {
	rotateModelId = requestAnimationFrame( rotateCurrentModel );

	let time = Date.now() * 0.0008;

	toystory.children.forEach( c => {
		if (!c.visible) return;

		c.rotation.y = time * 0.7;
	})
}

/**
 * Rotate main model.
 */
function rotateModel(){

	console.error(`rotateModel`);

	MODEL_1.css({ "background": "url('resources/images/bt-original-bg.png')" });
	MODEL_2.css({ "background": "url('resources/images/bt-clicked-bg.png')" });
	MODEL_3.css({ "background": "url('resources/images/bt-original-bg.png')" });

	rotateCurrentModel();

}

/**
 * Show overview of the main model.
 */
function showOverviewModel() {

	console.error(`showOverviewModel`);
	isOverviewClicked = true;
	isEarpodClicked   = false;

	MODEL_1.css({ "background": "url('resources/images/bt-clicked-bg.png')" });
	MODEL_2.css({ "background": "url('resources/images/bt-original-bg.png')" });
	MODEL_3.css({ "background": "url('resources/images/bt-original-bg.png')" });

	toystory.children.forEach( obj => {
		if (obj.name === 'Sony_01') obj.visible = true;
		if (obj.name === 'Sony_02') obj.visible = false;
	})

	cancelAnimationFrame(rotateModelId);
	cancelAnimationFrame(earpodAnimId);

	setTimeout(() =>{
		overviewAnimation();
	}, 500)

}

/**
 * Show earpod detail.
 */
function showEarPodDetail() {

	console.error(`showEarPodDetail`);

	isOverviewClicked = false;
	isEarpodClicked   = true;

	MODEL_1.css({ "background": "url('resources/images/bt-original-bg.png')" });
	MODEL_2.css({ "background": "url('resources/images/bt-original-bg.png')" });
	MODEL_3.css({ "background": "url('resources/images/bt-clicked-bg.png')" });

	toystory.children.forEach( obj => {
		if (obj.name === 'Sony_01') obj.visible = false;
		if (obj.name === 'Sony_02') obj.visible = true;
	})

	cancelAnimationFrame(overviewAnimId);
	cancelAnimationFrame(rotateModelId);

	setTimeout(() => {
		playEarpodAnim();
	}, 500)

}

window.onload = () => {

	let btnOverview = document.getElementById('model-1');
	let btnRotate = document.getElementById('model-2');
	let btnEarpodDetail = document.getElementById('model-3');

	btnOverview.addEventListener('click', () => showOverviewModel());
	btnRotate.addEventListener('click', () => rotateModel());
	btnEarpodDetail.addEventListener('click', () => showEarPodDetail());
}

/**
 * Show the progress of loading model
 * @param xhr
 */
function onProgress(xhr) {
	if (xhr.lengthComputable) {
		const percentComplete = xhr.loaded / xhr.total * 100;
		// console.warn(Math.round(percentComplete) + '%');

		// setProgress(Math.round(percentComplete));

		if (Math.round(percentComplete) === 100) {
			setTimeout(() => {

				// document.getElementById('hint').style.display = 'none';
			}, 1000);
		}
	}
}

/**
 * Show error if loading error.
 * @param e
 */
function onError(e) {
	console.error(e);
}