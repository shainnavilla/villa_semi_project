var canvas;
var gl;

var maxNumTriangles = 200;
var maxNumPositions = 3 * maxNumTriangles;
var index = 0;
var first = true;

var t = [];
var cIndex = 0;

var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 1.0, 0.0, 1.0)   // yellow
];

function init() {
    canvas = document.getElementById("myCanvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    // set this to your preferred background color
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Creating a vertex buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumPositions, gl.STATIC_DRAW);

    // enabling the aPosition variable of the vertex shader
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Creating a color buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumPositions, gl.STATIC_DRAW);

    // enabling the aColor variable of the vertex shader
    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // Making the menu work
    var menu = document.getElementById("menu");
    menu.addEventListener("click", function() {
        cIndex = menu.selectedIndex;
    });

    // Clear button functionality
    var clearButton = document.getElementById("clearButton");
    clearButton.addEventListener("click", function() {
        index = 0;
        first = true;
        gl.clear(gl.COLOR_BUFFER_BIT);
    });

    // Establishing the Main Loop
    canvas.addEventListener("mousedown", function(event) {
        // Getting the position of the mouse
        var xPos = 2 * (event.clientX/canvas.width) - 1;
        var yPos = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        var mousePos = vec2(xPos, yPos);

        // Setting corners of the rectangle
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

        if (first) {
            first = false;
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            t[0] = mousePos;
        } else {
            first = true;
            t[2] = mousePos;
            t[1] = vec2(t[0][0], t[2][1]);
            t[3] = vec2(t[2][0], t[0][1]);

            // Sending the corners to the GPU
            for (var i = 0; i < 4; i++) {
                gl.bufferSubData(gl.ARRAY_BUFFER, 8*(index+i), flatten(t[i]));
            }
            index += 4;

            // Color
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            var color = vec4(colors[cIndex]);
            for (var i = 0; i < 4; i++) {
                gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index-4+i), flatten(color));
            }
        }

        render();
    });
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < index; i += 4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
    }

    window.requestAnimationFrame(render);
}
function vec2(x, y) {
    return [x, y];
}
function vec4(x, y, z, w) {
    if (Array.isArray(x)) {
        return [x[0], x[1], x[2], x[3]];
    }
    return [x, y, z, w];
}

function flatten(v) {
    if (v.length === 2) {
        return new Float32Array(v);
    } else if (v.length === 4) {
        return new Float32Array(v);
    }
}
function initShaders(gl, vertexShaderId, fragmentShaderId) {
    var vertexShader;
    var fragmentShader;

    var vertexElement = document.getElementById(vertexShaderId);
    if (!vertexElement) {
        alert("Unable to load vertex shader " + vertexShaderId);
        return -1;
    } else {
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexElement.textContent.replace(/^\s+|\s+$/g, ''));
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            var msg = "Vertex shader failed to compile. The error log is:"
                + "<pre>" + gl.getShaderInfoLog(vertexShader) + "</pre>";
            alert(msg);
            return -1;
        }
    }
    var fragmentElement = document.getElementById(fragmentShaderId);
    if (!fragmentElement) {
        alert("Unable to load fragment shader " + fragmentShaderId);
        return -1;
    } else {
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentElement.textContent.replace(/^\s+|\s+$/g, ''));
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            var msg = "Fragment shader failed to compile. The error log is:"
                + "<pre>" + gl.getShaderInfoLog(fragmentShader) + "</pre>";
            alert(msg);
            return -1;
        }
    }
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var msg = "Shader program failed to link. The error log is:"
            + "<pre>" + gl.getProgramInfoLog(program) + "</pre>";
        alert(msg);
        return -1;
    }

    return program;
}
window.onload = init;