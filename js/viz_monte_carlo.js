console.log("Starting load of viz_monte_carlo.js");

var camera, scene, renderer;
var mesh;
var raycaster, intersects;
var mouse, INTERSECTED;
var orbitControls;

var particles;

var PARTICLE_SIZE = 1000;

var loadedShaderData;
var currentTimeIndex = 0;

var lastRelativeCameraPosition;
var pointArray;

var animating = false;
var animationId;

function pageLoadComplete() {
    console.log("pageLoadComplete");
    SHADER_LOADER.load(shaderLoadComplete);
}

function shaderLoadComplete(shaderData) {
    console.log("shaderLoadComplete");

    loadedShaderData = shaderData;

    waitForDataLoad();
}

function waitForDataLoad()
{
    if (sortedTimes.length == 0 || typeof sortedTimes == 'undefined' || typeof loadedPointData == 'undefined')
    {
        // console.log("waiting");
        setTimeout(waitForDataLoad, 50);
    }
    else
    {
        loadSliderAndPoints();
    }
}

function loadSliderAndPoints()
{
    init();
    updateTimeSliderAttributes();
    updateViaSlider('timeSlider', 'timeDisplay');
    firstDraw();        
    visualizeCurrentlySelectedPoints();
    animate();
}

function updateViaSlider(sliderName, divId)
{
    if (animating)
    {
        return;
    }

    let slider = document.getElementById(sliderName);
    let div = document.getElementById(divId);

    div.innerText = sortedTimes[slider.value];
    currentTimeIndex = slider.value;

    if (typeof pointArray != 'undefined')
    {

    }
    else
    {
        lastRelativeCameraPosition = new THREE.Vector3(0.0, 0.0, 0.0);
    }

    clearScene();
    visualizeCurrentlySelectedPoints();
}

function updateTimeSliderAttributes()
{
    let slider = document.getElementById('timeSlider');

    slider.setAttribute('min', 0);
    slider.setAttribute('max', sortedTimes.length-1);
    addTickMarksToSlider(slider);
}

function startAnimation()
{
    animating = true;
    animationId = setInterval(animateFrame, 100);   
}

function stopAnimation()
{
    animating = false;
}

function toggleAnimation()
{
    console.log('toggle');

    let button = document.getElementById("playButton");

    if (animating)
    {
        stopAnimation();
        button.innerText = 'Play';
    }
    else
    {
        startAnimation();
        button.innerText = 'Stop';
    }
}

function animateFrame()
{
    if (animating)
    {
        currentTimeIndex++;
        if (currentTimeIndex > sortedTimes.length-1)
        {
            currentTimeIndex = 0;
        }

        let slider = document.getElementById('timeSlider');
        slider.value = currentTimeIndex;

        let div = document.getElementById('timeDisplay');

        div.innerText = sortedTimes[slider.value];

        clearScene();
        visualizeCurrentlySelectedPoints();
    }
    else
    {
        clearInterval(animationId);
    }
}

function initCamera()
{
    camera.position.x = 50000;
    camera.position.y = 50000;
    camera.position.z = 50000;
    // camera.target = new THREE.Vector3(0.0, 0.0, 0.0);

    orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 120000;
    orbitControls.zoomSpeed = 2;
}

function init() {
    console.log("init");

    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 300000 );
    
    // camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x111111, 1);

    initCamera();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener( 'resize', onWindowResize, false);
    document.addEventListener( 'mousemove', onDocumentMouseMove, true);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function visualizeCurrentlySelectedPoints()
{
    pointArray = [];

    for (let idx in loadedPointData[sortedTimes[currentTimeIndex]])    
    {
        let el = loadedPointData[sortedTimes[currentTimeIndex]][idx];

        pointArray.push(el)
    }

    drawPointArray(pointArray);
}

function clearScene()
{
    for (let i = scene.children.length-1; i >= 0; i--)
    {
        // Remove unnamed children
        if (scene.children[i].name == "")
        {
            scene.remove(scene.children[i]); 
        }
    }
}

function ecifToThreeJSCoordinates(posX, posY, posZ)
{
    return new THREE.Vector3(-posX, posZ, posY);
}

function firstDraw()
{
    // Draw Earth
    var loader = new THREE.TextureLoader();
    loader.load('earth_atmos_1024.jpg', function ( texture ) {
      let earthGeometry = new THREE.SphereGeometry( 6371, 300, 300 );
      var earthMaterial = new THREE.MeshBasicMaterial({map: texture, overdraw: 0.5});
      var earthSphere = new THREE.Mesh(earthGeometry, earthMaterial);
      earthSphere.name = "earthSphere";
      scene.add(earthSphere);
    });

    var gridXZ = new THREE.GridHelper( 100000, 100, 0x404040, 0x202020);
    gridXZ.name = "gridXZ";
    scene.add( gridXZ );
}

function drawPointArray(pointArray) {
    let positions = new Float32Array( pointArray.length * 3 );
    let colors = new Float32Array( pointArray.length * 3 );
    let sizes = new Float32Array( pointArray.length );

    for (let i = 0; i < pointArray.length; i++)
    {
        let pos = ecifToThreeJSCoordinates(pointArray[i].rx, pointArray[i].ry, pointArray[i].rz);

        pos.toArray(positions, i * 3);

        let percent = ( (pointArray[i].id-1.0) / pointArray.length );

        let color = new THREE.Color(0.0, percent, 1.0 - percent);
        color.toArray( colors, i * 3 );

        sizes[i] = PARTICLE_SIZE * 0.5;
    }

    // Test to see if we improve camera usability
    // let oldZoom = orbitControls.object.zoom;
    orbitControls.target = new THREE.Vector3(positions[0], positions[1], positions[2]);
    // camera.position = lastRelativeCameraPosition + orbitControls.target;
    // orbitControls.object.zoom = oldZoom;
    orbitControls.update();

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
    geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

    // console.log("DEBUG: vertexShader:");
    // console.log(document.getElementById( 'vertexShader' ));

    // console.log("DEBUG: fragmentShader:");
    // console.log(document.getElementById( 'fragmentShader' ));

    var material = new THREE.ShaderMaterial( {
        uniforms: {
            color:   { value: new THREE.Color( 0xffffff ) },
            texture: { value: new THREE.TextureLoader().load( 'ball.png' ) }
        },
        vertexShader: loadedShaderData.point.vertex,
        fragmentShader: loadedShaderData.point.fragment,
        alphaTest: 0.9
    } );

    particles = new THREE.Points( geometry, material );
    scene.add( particles );



    // var gridXY = new THREE.GridHelper( 10000, 100, 0x00ff00, 0x004000);
    // gridXY.geometry.rotateX(Math.PI / 2);
    // scene.add( gridXY );

    // var gridYZ = new THREE.GridHelper( 10000, 100, 0x0000ff, 0x000040);
    // gridYZ.geometry.rotateX(Math.PI / 2);
    // gridYZ.geometry.rotateY(Math.PI / 2);
    // scene.add( gridYZ );

    container.appendChild( renderer.domElement );
}

// function getRandomColor() {
//     var letters = '0123456789ABCDEF';
//     var color = '#';
//     for (var i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
// }

function animate() {
    requestAnimationFrame( animate );
    // mesh.rotation.x += 0.005;
    // mesh.rotation.y += 0.01;

    // console.log('mouse.x: ' + mouse.x + ', mouse.y: ' + mouse.y);

    // handleMouseOver();

    renderer.render( scene, camera );
}

function handleMouseOver()
{
    var geometry = particles.geometry;
    var attributes = geometry.attributes;

    raycaster.setFromCamera( mouse, camera );
    intersects = raycaster.intersectObject( particles );

    if ( intersects.length > 0 )
    {
        if ( INTERSECTED != intersects[ 0 ].index )
        {
            attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
            INTERSECTED = intersects[ 0 ].index;
            attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE * 1.25;
            attributes.size.needsUpdate = true;
        }
    }
    else if ( INTERSECTED !== null )
    {
        attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
        attributes.size.needsUpdate = true;
        INTERSECTED = null;
    }
}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

// From here: http://thenewcode.com/864/Auto-Generate-Marks-on-HTML5-Range-Sliders-with-JavaScript
function addTickMarksToSlider(element) {
    var datalist = document.createElement('datalist'),
    minimum = parseInt(element.getAttribute('min')),
    step = parseInt(element.getAttribute('step')),
    maximum = parseInt(element.getAttribute('max'));
    datalist.id = element.getAttribute('list');
    for (var i = minimum; i < maximum+step; i = i + step) {
        datalist.innerHTML +="<option value="+i+"></option>";
    }
    element.parentNode.insertBefore(datalist, element.nextSibling);
}