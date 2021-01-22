
// Declare variables
const SWIPE_AREA = $('#swipe-area');
const MODEL_1 = $('#model-1');
const MODEL_2 = $('#model-2');
const MODEL_3 = $('#model-3');
const BUTTON_ICON_1 = $('#bt-icon-1');
const BUTTON_ICON_2 = $('#bt-icon-2');
const BUTTON_ICON_3 = $('#bt-icon-3');

let camera, scene, renderer;
let object, mixer1, mixer2;
let action1, action2;
let light1, directionalLight, spotLight;
let clock = new THREE.Clock();
let world = new THREE.Object3D();
let elementArray = [];

let mainURL = 'https://intra.letsee.io/3D-model/fbx/sony/';

function initWorld() {
	
	// Using renderer, camera and scene from Engine.
	renderer = letsee.threeRenderer;
	camera = renderer.camera;
	scene = renderer.scene;
	
	// Adding lights
	light1 = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF, 1);
	scene.add( light1 );
	
	directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 0, 200, 100 );
	directionalLight.castShadow = true;
	directionalLight.shadow.camera.top = 180;
	directionalLight.shadow.camera.bottom = - 100;
	directionalLight.shadow.camera.left = - 120;
	directionalLight.shadow.camera.right = 120;
	scene.add( directionalLight );
	
	// Loading model
	let promise = loadScript(1, mainURL + 'Sony_01_7.fbx')
		.then(function (result) {
			console.log(result);
			return loadScript(2, mainURL + 'Sony_earphon_V5_0103_10.fbx');
		})
		.then(result => console.log(result));
	
	renderer.addObjectToEntity('sony.json', world);
	
}

function loadScript(id, src) {
	return new Promise(function(resolve, reject) {
		
		// load models here...
		let loader = new THREE.FBXLoader();
		
		loader.load(src, function ( obj ) {
			
			if (obj.animations.length) {
				console.log('PLAY MODEL ANIMATION.');
				if (id === 1) {
					mixer1 = new THREE.AnimationMixer( obj );
					action1 = mixer1.clipAction( obj.animations[0]);
					action1.play();
				}
				else if (id === 2) {
					mixer2 = new THREE.AnimationMixer( obj );
					action2 = mixer2.clipAction( obj.animations[0]);
					action2.play();
				}
			}
			
			obj.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			} );
			
			obj.name ='item'+id;
			
			if (id === 1) {
				obj.type ='Sony_01';
				obj.position.y = -100;
				obj.rotation.y = 24;
				obj.scale.setScalar(30);
			}
			else if (id === 2) {
				obj.type ='Sony_02';
				obj.position.y = -250;
				obj.position.x = 10;
				
				obj.rotation.y = -315;
				obj.scale.setScalar(50);
			}
			
			(id === 1) ? obj.visible = true : obj.visible = false;
			
			world.add(obj);
			elementArray.push(obj);
			
			resolve(`Id: ${id}, ${src} is loaded!`);
		});
	});
}

// This plays model's animation
let flag1 = true;
let flag2= false;
let flag3= false;

function animate() {
	
	if (flag1){
		requestAnimationFrame( animate );
	}
	
	var delta = clock.getDelta();
	if ( mixer1 ) mixer1.update( delta );
}

function animate2() {
	
	if (flag2){
		requestAnimationFrame( animate2 );
	}
	
	var delta = clock.getDelta();
	if ( mixer2 ) mixer2.update( delta );
}

// This plays manual animation
var count = 0;
function rotateMe() {
	
	if(flag3) {
		requestAnimationFrame( rotateMe );
	}
	
	var time = Date.now() * 0.0008;
	
	if (world.children[0] !== undefined) {
		world.children[0].rotation.y = time * 0.7;
	}
}

MODEL_1.click(function () {

	MODEL_1.css({ "background": "url('resources/images/bt-clicked-bg.png')" });
	MODEL_2.css({ "background": "url('resources/images/bt-original-bg.png')" });
	MODEL_3.css({ "background": "url('resources/images/bt-original-bg.png')" });
	
	resetOthersModels('item1');
	
	if(action1 !== undefined) {
		action1.reset();
		
		// reset model to original states
		world.children[0].rotation.set(0, 24, 0);
		world.children[0].quaternion.set(0, -0.5365729180004349, 0, 0.8438539587324921);
	}
	
	flag2 = false;
	flag3 = false;
	flag1 = true;
	animate();
});

MODEL_2.click(function () {
	
	MODEL_1.css({ "background": "url('resources/images/bt-original-bg.png')" });
	MODEL_2.css({ "background": "url('resources/images/bt-clicked-bg.png')" });
	MODEL_3.css({ "background": "url('resources/images/bt-original-bg.png')" });
	
	resetOthersModels('item2');
	
	if(action2 !== undefined) {
		action2.reset();
		
		// reset model to original states
		world.children[0].rotation.set(0, -315, 0);
		world.children[0].quaternion.set(0, -0.4080958218391593, 0, 0.9129390999389944);

	}
	
	flag1 = false;
	flag3 = false;
	flag2 = true;
	animate2();
	
});

MODEL_3.click(function () {
	
	MODEL_1.css({ "background": "url('resources/images/bt-original-bg.png')" });
	MODEL_2.css({ "background": "url('resources/images/bt-original-bg.png')" });
	MODEL_3.css({ "background": "url('resources/images/bt-clicked-bg.png')" });
	
	if (count  > 0) {
		flag3 = false;
		count  =0;
	}
	else {
		count = count + 1;
		flag3 = true;
		rotateMe();
	}
	
	
	// flag3 = true;
	// rotateMe();
	
});

// SWIPE_AREA.on('swipe', function(event, slick, direction) {
// 	// console.log('CURRENT SLIDE: ' + document.getElementsByClassName('slick-active')[0].id);
// 	var currentItem = document.getElementsByClassName('slick-active')[0].id;
// 	resetOthersModels(currentItem);
// });

function resetOthersModels(index) {
	
	// remove all childs
	for( var i = world.children.length - 1; i >= 0; i--) {
		world.remove(world.children[i]);
	}
	
	// add current one [index]
	for (var j=0;j<elementArray.length;j++) {
		if (elementArray[j].name === index) {
			world.add(elementArray[j]);
			world.children[0].visible = true;
		}
	}
}
