import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js'
import { Capsule } from 'three/addons/math/Capsule.js'
const scene = new THREE.Scene();
const canvas = document.getElementById("experience-canvas")
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const GRAVITY = 30
const CAPSULE_RADIUS = 0.35
const CAPSULE_HEIGHT = 1
const JUMP_HEIGHT = 10
const MOVE_SPEED = 10
let character = {
    instance: null,
    // moveDistance: 3,
    // jumpHeight: 1,
    isMoving: false,
    // moveDuration: 0.2
    spawnPosition: new THREE.Vector3()
}
let targetRotation = Math.PI / 2
const colliderOctree = new Octree()
const playerCollider = new Capsule(
    new THREE.Vector3(0, CAPSULE_RADIUS, 0),
    new THREE.Vector3(0, CAPSULE_HEIGHT, 0), CAPSULE_RADIUS)
let playerOnFloor = false
let playerVelocity = new THREE.Vector3()
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.shadowMap.enabled = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.75
const modalContent = {
    "Project_1": {
        title: "Project One",
        content: 'this is project javascript',
        link: "https://example.com/"
    },
    "Project_2": {
        title: "Project Two",
        content: 'this is project javascript',
        link: "https://example.com/"
    },
    "Project_3": {
        title: "Project Three",
        content: 'this is project javascript',
        link: "https://example.com/"
    },
    Chest: {
        title: 'about me',
        content: 'this is a project'
    }
}
const modal = document.querySelector('.modal')
const modalTitle = document.querySelector('.modal-title')
const modalProjectDescription = document.querySelector('.modal-project-description')
const modalExitButton = document.querySelector('.modal-exit-button')
const modalVisitProjectButton = document.querySelector('.modal-project-visit-button')
function showModal(id) {
    const content = modalContent[id]
    if (content) {
        modalTitle.textContent = content.title
        modalProjectDescription.textContent = content.content
        if (content.link) {
            modalVisitProjectButton.href = content.link
            modalVisitProjectButton.classList.remove('hidden')
        } else {
            modalVisitProjectButton.classList.add('hidden')
        }
        modal.classList.toggle('hidden')
    }
}

function hideModal() {
    modal.classList.toggle('hidden')
}
const intersectObjects = []
let intersectObject = ''
const intersectObjectsNames = [
    "Project_1",
    "Project_2",
    "Project_3",
    "Chicken",
    "Pikachu",
    "Bulbasaur",
    "Chest"
]
const loader = new GLTFLoader();

loader.load('./portfolio4.glb',
    function (glb) {
        console.log(glb)
        glb.scene.traverse((child) => {
            if (intersectObjectsNames.includes(child.name)) {
                intersectObjects.push(child)
            }
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                console.log(child.material)
                child.material.metalness = 0.5
                if (child.material.name === "Dress Pink") {
                    child.material.color.setRGB(0, 0, 0)
                }
            }
            if (child.name === 'Character') {
                character.spawnPosition.copy(child.position)
                character.instance = child
                playerCollider.start.copy(child.position).add(new THREE.Vector3(0, CAPSULE_RADIUS, 0))
                playerCollider.end.copy(child.position).add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0))
            }
            if (child.name === 'Ground_Collider') {
                colliderOctree.fromGraphNode(child)
                child.visible = false
            }
        })
        scene.add(glb.scene)
    }, undefined, function (error) {

        console.error(error);

    });
const sun = new THREE.DirectionalLight(0xFFFFFF);
sun.castShadow = true
sun.position.set(75, 80, 0)
sun.target.position.set(50, 0, 0)
sun.shadow.mapSize.width = 4096
sun.shadow.mapSize.height = 4096
sun.shadow.camera.left = -100
sun.shadow.camera.right = 100
sun.shadow.camera.top = 100
sun.shadow.camera.bottom = -100
sun.shadow.normalBias = 0.2
scene.add(sun);
const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
scene.add(shadowHelper);
const helper = new THREE.DirectionalLightHelper(sun, 5);
scene.add(helper);

const light = new THREE.AmbientLight(0x404040, 3);
scene.add(light);
const aspect = sizes.width / sizes.height
const camera = new THREE.OrthographicCamera(-aspect * 50, aspect * 50, 50, -50, 1, 1000);


camera.position.x = -13;
camera.position.y = 39;
camera.position.z = -67;
const cameraOffset = new THREE.Vector3(-13, 39, -67)
camera.zoom = 2
camera.updateProjectionMatrix()
const controls = new OrbitControls(camera, canvas);
controls.update()
function onResize() {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    const aspect = sizes.width / sizes.height
    camera.aspect = sizes.width / sizes.height
    camera.left = - aspect * 50
    camera.right = aspect * 50
    camera.top = 50,
        camera.bottom = -50
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
function jumpCharacter(meshID) {
    const mesh = scene.getObjectByName(meshID)
    const jumpHeight = 2
    const jumpDuration = 0.5
    const t1 = gsap.timeline()
    t1.to(mesh.scale, {
        x: 1.2,
        y: 0.8,
        z: 1.2,
        duration: jumpDuration * 0.2,
        ease: 'power2.out'
    })
    t1.to(mesh.scale, {
        x: 0.8,
        y: 1.3,
        z: 0.8,
        duration: jumpDuration * 0.3,
        ease: 'power2.out'
    })
    t1.to(mesh.position, {
        y: mesh.position.y + jumpHeight,
        duration: jumpDuration * 0.5,
        ease: 'power2.out'
    }, '<')
    t1.to(mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: jumpDuration * 0.3,
        ease: 'power1.inOut'
    })
    t1.to(mesh.position, {
        y: mesh.position.y,
        duration: jumpDuration * 0.5,
        ease: 'bounce.out'
    }, '>')
    t1.to(mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: jumpDuration * 0.2,
        ease: 'elastic.out(1, 0.3'
    })
    t1.to(mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: jumpDuration * 0.2,
        ease: 'elastic.out(1, 0.3)'
    })
}

function onClick() {
    if (intersectObject !== '') {
        if (["Bulbasaur", "Chicken", "Pikachu"].includes(intersectObject)) {
            jumpCharacter(intersectObject)
        } else {
            showModal(intersectObject)
        }
    }
}

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
}
// function onClick() {
//     console.log(intersectObject)
//     if (intersectObject !== '') {
//         showModal(intersectObject)
//     }
// }
// function moveCharacter(targetPosition, targetRotation) {
//     character.isMoving = true
//     // let rotationDiff =
//     //     ((((targetRotation = -character.instance.rotation.y) % (2 * Math.PI)) +
//     //         3 * Math.PI) % (2 * Math.PI)) - Math.PI
//     // let finalRotation = character.instance.rotation.y + rotationDiff
//     let rotationDiff =
//         ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
//             3 * Math.PI) %
//             (2 * Math.PI)) -
//         Math.PI;
//     let finalRotation = character.instance.rotation.y + rotationDiff;
//     const t1 = gsap.timeline({
//         onComplete: () => {
//             character.isMoving = false
//         }
//     })
//     t1.to(character.instance.position, {
//         x: targetPosition.x,
//         z: targetPosition.z,
//         duration: character.moveDuration
//     })
//     t1.to(character.instance.rotation, {
//         y: finalRotation,
//         duration: character.moveDuration
//     }, 0)
//     t1.to(character.instance.position, {
//         y: character.instance.position.y + character.jumpHeight,
//         duration: character.moveDuration / 2,
//         yoyo: true,
//         repeat: 1
//     }, 0)
// }
function respawnCharacter() {
    character.instance.position.copy(character.spawnPosition)
    playerCollider.start.copy(character.spawnPosition).add(new THREE.Vector3(0, CAPSULE_RADIUS, 0))
    playerCollider.end.copy(character.spawnPosition).add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0))
    playerVelocity.set(0, 0, 0)
    character.isMoving = false
}


function playerCollisions() {
    const result = colliderOctree.capsuleIntersect(playerCollider)
    playerOnFloor = false
    if (result) {
        playerOnFloor = result.normal.y > 0
        playerCollider.translate(result.normal.multiplyScalar(result.depth))
        if (playerOnFloor) {
            character.isMoving = false
            playerVelocity.x = 0
            playerVelocity.z = 0
        }
    }
}
function updatePlayer() {
    if (!character.instance) return
    if (character.instance.position.y < -20) {
        respawnCharacter()
        return
    }
    if (!playerOnFloor) {
        playerVelocity.y -= GRAVITY * 0.035
    }
    playerCollider.translate(playerVelocity.clone().multiplyScalar(0.035))
    playerCollisions()
    character.instance.position.copy(playerCollider.start)
    character.instance.position.y -= CAPSULE_RADIUS
    let rotationDiff =
        ((((targetRotation - character.instance.rotation.y) % (2 * Math.PI)) +
            3 * Math.PI) %
            (2 * Math.PI)) -
        Math.PI;
    let finalRotation = character.instance.rotation.y + rotationDiff;
    character.instance.rotation.y = THREE.MathUtils.lerp(character.instance.rotation.y, finalRotation, 0.4)
}
function onKeyDown(event) {
    if (event.key.toLowerCase() === 'r') {
        respawnCharacter()
        return
    }
    if (character.isMoving) return
    switch (event.key.toLowerCase()) {
        case "w":
        case 'arrowup':
            playerVelocity.z += MOVE_SPEED
            targetRotation = 0
            break
        case "s":
        case 'arrowdown':
            playerVelocity.z -= MOVE_SPEED
            targetRotation = Math.PI
            break
        case "a":
        case 'arrowleft':
            playerVelocity.x += MOVE_SPEED
            targetRotation = Math.PI / 2
            break
        case "d":
        case 'arrowright':
            playerVelocity.x -= MOVE_SPEED
            targetRotation = -Math.PI / 2
            break
        default:
            return
    }
    playerVelocity.y = JUMP_HEIGHT
    character.isMoving = true
}

modalExitButton.addEventListener('click', hideModal)
window.addEventListener('resize', onResize)
window.addEventListener('click', onClick)
window.addEventListener('pointermove', onPointerMove)
window.addEventListener('keydown', onKeyDown)
function animate() {
    updatePlayer()
    if (character.instance) {
        const targetCameraPosition = new THREE.Vector3(character.instance.position.x + cameraOffset.x, cameraOffset.y,
            character.instance.position.z + cameraOffset.z
        )
        camera.position.copy(targetCameraPosition)
        camera.lookAt(character.instance.position.x, camera.position.y - 39, character.instance.position.z)
    }
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(intersectObjects)
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer'
    } else {
        document.body.style.cursor = 'default'
        intersectObject = ''
    }
    for (let i = 0; i < intersects.length; i++) {
        // intersects[i].object.material.color.set(0xff0000)
        intersectObject = intersects[0].object.parent.name
    }
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

