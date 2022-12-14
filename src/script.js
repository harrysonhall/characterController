import './style.css'
import * as THREE from 'three';
import * as dat from 'lil-gui'
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from 'stats.js'
import { gsap } from 'gsap'
import { AnimationMixer, Group, LoadingManager, LoopOnce, Vector3 } from 'three';



const canvas = document.querySelector("canvas.webgl");


		const sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		};

		const keyStates = {
			forward: false,
			backward: false,
			left: false,
			right: false,
			space: false,
			shift: false,
		};

		const characterStates = {
			idle: true,
			walk: false,
			run: false,
			jump: false,
		}

		function onKeyDown(keydownevent) {
			switch(keydownevent.code) {

				case 'KeyW':
					keyStates.forward = true;
					characterStates.idle = false;
					characterStates.walk = true;
						break;

				case 'KeyA':
					keyStates.left = true;
						break;

				case 'KeyS':
					keyStates.backward = true;
					characterStates.idle = false;
					characterStates.walk = true;
						break;

				case 'KeyD':
					keyStates.right = true;
						break;
				
				case 'ShiftLeft':
					keyStates.shift = true;
					characterStates.run = true;
						break;

				case 'Space':
					keyStates.space = true;
					characterStates.jump = true;
						break;
			}
		}
		
		function onKeyUp(keyupevent) {
			switch(keyupevent.code) {

				case 'KeyW':
					keyStates.forward = false;
					characterStates.idle = true;
					characterStates.walk = false;
						break;

				case 'KeyA':
					keyStates.left = false;
						break;

				case 'KeyS':
					keyStates.backward = false;
					characterStates.idle = true;
					characterStates.walk = false;
						break;

				case 'KeyD':
					keyStates.right = false;
						break;
				
				case 'ShiftLeft':
					keyStates.shift = false;
					characterStates.run = false
						break;

				case 'Space':
					keyStates.space = false;
					characterStates.jump = false;
						break;
			}
		}


const clock = new THREE.Clock();
const gui = new dat.GUI()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
const renderer = new THREE.WebGL1Renderer({ canvas: canvas, antialias: true });
const loadingManager = new THREE.LoadingManager()
let resourcesLoaded = false
let progress;
const controls = new OrbitControls(camera, canvas);
const stats = new Stats()

		loadingManager.onStart = function (url,loaded, total){
			console.log('loading items')
		}

		loadingManager.onProgress = function (url, loaded, total) {
			progress = loaded/total * 100
			// console.log(loaded/total * 100, "% ", url)
			if(progress === 100) {
				console.log('progress completed')
				resourcesLoaded = true
			}

		}

		
			
		

		stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild(stats.dom)

		renderer.outputEncoding = THREE.sRGBEncoding
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(sizes.width, sizes.height);
		renderer.render(scene, camera);

		controls.enableDamping = true;


const light = new THREE.AmbientLight(0xFFFFFF, 0.25);
const boxMeshGroup = new THREE.Group()
const polyMeshGroup = new THREE.Group()

const planeGeometry = new THREE.PlaneGeometry(100, 100, 10, 10)
const planeMaterial = new THREE.MeshBasicMaterial({ color: 'grey' })
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;

const boxGeometry = new THREE.BoxGeometry(1,1,1)
const boxMaterial = new THREE.MeshBasicMaterial({ color: 'grey' })
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
const boxMeshCameraPosition = boxMesh.clone()
const boxMeshCamera = boxMesh.clone()
const boxMeshDirection = boxMesh.clone()
const boxMeshtoFollow = boxMesh.clone()

const gridHelper = new THREE.GridHelper(60, 60)
const axesHelper = new THREE.AxesHelper(30, 30)
const polymanAxesHelper = new THREE.AxesHelper(20, 20)
const boxMeshAxesHelper = new THREE.AxesHelper(10, 10)

		boxMeshCameraPosition.position.set(13,7,0)
		boxMeshDirection.position.set(-5, 0, 0)
		boxMeshCamera.position.set(13,7,0)
		boxMeshCameraPosition.material = new THREE.MeshBasicMaterial({ color: 'yellow', wireframe: true })
		boxMeshDirection.material = new THREE.MeshBasicMaterial({ color: 'red', wireframe: true })
		boxMeshtoFollow.material = new THREE.MeshBasicMaterial({ color: 'red', wireframe: true })
		boxMeshGroup.add(boxMeshtoFollow, boxMeshCameraPosition, boxMeshDirection, boxMeshAxesHelper)
		polyMeshGroup.add(boxMesh)


		scene.add(light)
		scene.add(camera)
		scene.add(boxMesh, boxMeshGroup, boxMeshCamera)
		scene.add(gridHelper,axesHelper)
		scene.add(polyMeshGroup)

				// TO BE REMOVED: Temporary for editing animations while character is in place.
				boxMaterial.transparent = true
				boxMaterial.opacity = 1
				///////////////////////////////////////////////////////////////////////////////


const hemilight = new THREE.HemisphereLight(0x6d9ce8, 0x1d3152, 0.05);
const directionalLight = new THREE.DirectionalLight(0x2d498c, 0.5);
const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);

		directionalLight.position.set(20, 30, -30);
		directionalLight.castShadow = true;
		scene.add(directionalLight, dirLightHelper);
		scene.add(hemilight);
	

		// Event Listeners
		window.addEventListener("resize", () => {
			sizes.width = window.innerWidth;
			sizes.height = window.innerHeight;

			camera.aspect = sizes.width / sizes.height;
			camera.updateProjectionMatrix();

			renderer.setSize(sizes.width, sizes.height);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		});

		window.addEventListener('keydown', (keydownevent) => { onKeyDown(keydownevent) })

		window.addEventListener('keyup', (keyupevent) => { onKeyUp(keyupevent) })



const globalAnimations = []
const fbxLoader = new FBXLoader(loadingManager)
const fbxAnimationLoader = new FBXLoader(loadingManager)
const guiFolder1 = gui.addFolder('times')

		let animationMixer;
		let animationAction;
		let globalPolyman;

		fbxLoader.load('/animations/polyman.fbx', (fbx) => {
			animationMixer = new THREE.AnimationMixer(fbx)
			globalPolyman = fbx;
			fbx.rotation.y = Math.PI * -0.5
			fbx.add(polymanAxesHelper)
			polyMeshGroup.add(fbx)

					fbxAnimationLoader.load('animations/breathing-idle-animation.fbx', (idleAnimation) => { 
						idleAnimation.animations[0].name = 'Idle'
						animationAction = animationMixer.clipAction(idleAnimation.animations[0]);
						gui.add(animationAction, 'weight').min(0).max(1).enable(true).step(0.01).name('idle weight:').listen(true)
						animationAction.weight = 1
						animationAction.play();
						globalAnimations.push(idleAnimation.animations[0]);
					});

					fbxAnimationLoader.load('animations/polyman-walking-animation60fps.fbx', (walkingAnimation) => { 
						walkingAnimation.animations[0].name = 'Walking'
						animationAction = animationMixer.clipAction(walkingAnimation.animations[0])
						gui.add(animationAction, 'weight').min(0).max(1).enable(true).step(0.01).name('walking weight:').listen(true)
						guiFolder1.add(animationAction, 'time').min(0).max(1).enable(true).name('walking time').listen(true)
						animationAction.weight = 0
						animationAction.play();
						globalAnimations.push(walkingAnimation.animations[0]); 
					})

					fbxAnimationLoader.load('animations/polyman-running-animation60fps.fbx', (runningAnimation) => { 
						runningAnimation.animations[0].name = 'Running'
						animationAction = animationMixer.clipAction(runningAnimation.animations[0])
						gui.add(animationAction, 'weight').min(0).max(1).enable(true).step(0.01).name('running weight:').listen(true)
						guiFolder1.add(animationAction, 'time').min(0).max(0.6666666865348816).enable(true).name('running time').listen(true)
						animationAction.weight = 0
						animationAction.play();
						globalAnimations.push(runningAnimation.animations[0]);
					})

					fbxAnimationLoader.load('animations/polyman-jumping-animation60fps.fbx', (jumpingAnimation) => { 
						jumpingAnimation.animations[0].name = 'Jumping'
						animationAction = animationMixer.clipAction(jumpingAnimation.animations[0])
						gui.add(animationAction, 'weight').min(0).max(1).enable(true).step(0.01).name('jumping weight:').listen(true)
						guiFolder1.add(animationAction, 'time').min(0).max(1).enable(true).name('jumping time').listen(true)
						animationAction.weight = 0;
						globalAnimations.push(jumpingAnimation.animations[0]);
						console.log(jumpingAnimation.animations[0])
					})

			scene.add(fbx);
			
		});


const positionToWorld = new THREE.Vector3()
const cameraPositionToWorld = new THREE.Vector3()
const boxMeshDirectionVec = new THREE.Vector3()
const cameraTargetVector = new THREE.Vector3()

let previousTime = 0;
let deltaTime = 0;
let speedResult = 0.05;
let speedFactor = 0.05;

const updateKeyboardInput = () => {

	if(globalPolyman) {

		boxMeshtoFollow.getWorldPosition(positionToWorld);
		boxMeshCameraPosition.getWorldPosition(cameraPositionToWorld);
		boxMeshDirection.getWorldPosition(boxMeshDirectionVec);
		
				if (keyStates.shift) {
					speedFactor = 0.09;		// If you want to change the actual SPEED itself, edit this here.
				} else if (!keyStates.shift) {
					speedFactor = 0.03;
				}

				if (keyStates.forward) {
							// TEMPORARY DISABLEMENT:
					boxMeshGroup.translateOnAxis(boxMeshDirection.position, speedResult);
				}

				if (keyStates.backward) {
							// TEMPORARY DISABLEMENT:
					boxMeshGroup.translateOnAxis(boxMeshDirection.position, -speedResult);
				}

				if (keyStates.left) {
							// TEMPORARY DISABLEMENT:
					boxMeshGroup.rotation.y += 0.05; // Edit this to change the SPEED of the rotation.
				}

				if (keyStates.right) { 
							// TEMPORARY DISABLEMENT:
					boxMeshGroup.rotation.y += -0.05;	// Edit this to change the SPEED of the rotation.
				}

				if (keyStates.space) {
					
				}

		speedResult += (speedFactor - speedResult) * 0.05 // If you want to change how fast the TRANSITION of speed is, edit this here 0.1 value to something else.
		

		boxMesh.add(globalPolyman);

				// TEMPORARY DISABLEMENT start: Temporary disablement for editing animations while character is in place.
					boxMesh.position.x += (positionToWorld.x - boxMesh.position.x) * 0.15
					boxMesh.position.z += (positionToWorld.z - boxMesh.position.z) * 0.15
					boxMeshCamera.position.x += (cameraPositionToWorld.x - boxMeshCamera.position.x) * 0.05
					boxMeshCamera.position.z += (cameraPositionToWorld.z - boxMeshCamera.position.z) * 0.05
				// TEMPORARY DISABLEMENT end:

		boxMesh.rotation.y += (boxMeshGroup.rotation.y - boxMesh.rotation.y) * 0.1

		cameraTargetVector.set(boxMesh.position.x, boxMesh.position.y + 3, boxMesh.position.z)
		controls.target = cameraTargetVector
		camera.position.set(boxMeshCamera.position.x, boxMeshCamera.position.y, boxMeshCamera.position.z)

	}

}

let currentIdleState = 1;
let desiredIdleState = 1;
let currentWalkingState = 0;
let desiredWalkingState = 0;
let currentRunningState = 0;
let desiredRunningState = 0;
let currentJumpingState = 0;
let desiredJumpingState = 0;



const updateAnimationState = () => {

	const idleAction = animationMixer.clipAction(globalAnimations[0])	
	const walkingAction = animationMixer.clipAction(globalAnimations[1])
	const runningAction = animationMixer.clipAction(globalAnimations[2])
	const jumpingAction = animationMixer.clipAction(globalAnimations[3])

		
	const animationActions = [];

			
			idleAction.weight = currentIdleState; animationActions.push(idleAction);
			walkingAction.weight = currentWalkingState; animationActions.push(walkingAction);
			runningAction.weight = currentRunningState;	animationActions.push(runningAction);
			
			walkingAction.paused = false
			runningAction.paused = false

			jumpingAction.weight = currentJumpingState; 
			
			idleAction.timeScale = 1
			walkingAction.timeScale = 1
			runningAction.timeScale = 1 / 1.5
			jumpingAction.timeScale = 1

			let jumpingTime = Math.round(jumpingAction.time * 100)


					if(jumpingTime >= 60 && characterStates.walk) {
						desiredIdleState = 0;
						desiredWalkingState = 1;
						desiredRunningState = 0;
					}

					if(jumpingTime >= 60 && characterStates.run) {
						desiredIdleState = 0;
						desiredWalkingState = 0;
						desiredRunningState = 1;
					}


			if (jumpingAction.isRunning()) {


					
					currentWalkingState += (desiredWalkingState - currentWalkingState) * 0.3
					currentRunningState += (desiredRunningState - currentRunningState) * 0.3

					if(jumpingTime <= 50 ){
						currentJumpingState += (desiredJumpingState - currentJumpingState) * 0.4
						currentIdleState += (desiredIdleState - currentIdleState) * 0.4
					} else if (jumpingTime > 50) {
						currentJumpingState += (desiredJumpingState - currentJumpingState) * 0.1
						currentIdleState += (desiredIdleState - currentIdleState) * 0.1
					}

							if(jumpingTime <= 99) {
								desiredJumpingState = 1;
							}

							if(jumpingTime >= 98 ) {
								jumpingAction.paused = true;
								desiredJumpingState = 0;
								jumpingAction.time = 0;
							}
							
							if(characterStates.jump){
								desiredIdleState = 0;
								desiredWalkingState = 0;
								desiredRunningState = 0;
								desiredJumpingState = 1;
							}

							if (characterStates.idle) {
								desiredWalkingState = 0;
								desiredRunningState = 0;
							}

								if(jumpingTime >= 60 && characterStates.idle) {
									desiredIdleState = 1;
									desiredWalkingState = 0;
									desiredRunningState = 0;
									desiredJumpingState = 0;
								} 

								if(jumpingTime >= 60 && characterStates.walk) {
									desiredIdleState = 0;
									desiredWalkingState = 1;
									desiredRunningState = 0;
									desiredJumpingState = 0;
								} 


						
							if (characterStates.run && characterStates.walk) {
								desiredIdleState = 0;
								desiredWalkingState = 0;
								desiredRunningState = 0;
								
								walkingAction.timeScale = 1 
								runningAction.timeScale = 1 / 1.5
								jumpingAction.timeScale = 1 
							}

							if (characterStates.run && characterStates.walk && keyStates.backward) {
								walkingAction.timeScale = -1 * 1.5
								runningAction.timeScale = -1
								// jumpingAction.timeScale = -1 
							}

							// if (characterStates.backward) {
							// 	jumpingAction.timeScale = -1 
							// }

					walkingAction.time = jumpingAction.time
					runningAction.time = jumpingAction.time / 1.5
				
			}

			if (!jumpingAction.isRunning()){

					currentIdleState += (desiredIdleState - currentIdleState) * 0.05
					currentWalkingState += (desiredWalkingState - currentWalkingState) * 0.1
					currentRunningState += (desiredRunningState - currentRunningState) * 0.05
					currentJumpingState += (desiredJumpingState - currentJumpingState) * 0.1

							if (keyStates.backward) {
								walkingAction.timeScale = -1
								runningAction.timeScale = -1 / 1.5
							} 

							if (characterStates.idle) {
								walkingAction.paused = true
								runningAction.paused = true
								desiredIdleState = 1;
								desiredWalkingState = 0;
								desiredRunningState = 0;
								desiredJumpingState = 0;
							}

							if (characterStates.walk) {
								desiredIdleState = 0;
								desiredWalkingState = 1;
								desiredRunningState = 0;
								desiredJumpingState = 0;
								runningAction.time = walkingAction.time /1.5
							}


							if (characterStates.run && characterStates.walk) {
								desiredIdleState = 0;
								desiredWalkingState = 0;
								desiredRunningState = 1;
								desiredJumpingState = 0;
								walkingAction.timeScale = 1 * 1.5
								runningAction.timeScale = 1
							}

							if (characterStates.run && characterStates.walk && keyStates.backward) {
								desiredIdleState = 0;
								desiredWalkingState = 0;
								desiredRunningState = 1;
								desiredJumpingState = 0;
								walkingAction.timeScale = -1 * 1.5
								runningAction.timeScale = -1
							}
						
							
							if(characterStates.jump && !keyStates.backward) {
								desiredIdleState = 0;
								desiredWalkingState = 0;
								desiredRunningState = 0;
								desiredJumpingState = 1;
								jumpingAction.play()
								jumpingAction.paused = false
							}

							if(idleAction.weight > 0.995) {
								desiredJumpingState = 0
						}
						
			}


				// This is to stop the Animation Weights from continously computing when the respective animations aren't being shown.
				for(const animation of animationActions){
						let animationWeight = animation.weight

								if (animationWeight < 0.00005 && characterStates.idle) {
									animation.weight = 0;
								}
				}

				if(idleAction.weight > 0.995) {
						walkingAction.time = 0
						runningAction.time = 0
				}
				
				if(characterStates.idle && characterStates.run){
					desiredRunningState = 0;
				}
}

const tick = (time) => {
		stats.begin();
		stats.end();

		const elapsedTime = clock.getElapsedTime()
		deltaTime = elapsedTime - previousTime
		previousTime = elapsedTime

		updateKeyboardInput()

		renderer.render(scene, camera);
		controls.update();
		window.requestAnimationFrame(tick);


				// if(globalPolyman && globalAnimations){
				// 	animationMixer.update(deltaTime)
				// 	updateAnimationState()
				// }

				if(resourcesLoaded){
					animationMixer.update(deltaTime)
					updateAnimationState()
				}
			
}

tick();


	
