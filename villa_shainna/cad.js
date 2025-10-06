var canvas;
var gl;
var maxNumTriangles = 200;
var maxNumPositions = 3 * maxNumTriangles;
var index = 0;
var first = true;
var t = [];
var cIndex = 0; 

var colors = [
  [1, 0.08, 0.38, 1], // Pink
  [1, 0.5, 0, 1],     // Orange
  [0, 0.5, 1, 1],     // Blue
  [0, 1, 0, 1],       // Green
  [1, 1, 0, 1]        // Yellow
];

init();

function init() {
    canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl2");
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.96, 0.87, 0.70, 1); // nude background
    gl.clear(gl.COLOR_BUFFER_BIT);

      var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Position buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumPositions, gl.STATIC_DRAW);

      var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Color buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumPositions, gl.STATIC_DRAW);

      var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    // Menu selection
    var menu = document.getElementById("menu");
    menu.addEventListener("click", function () {
        cIndex = menu.selectedIndex;
        console.log("Selected color index:", cIndex);
    });

    // Clear button
    document.getElementById("clearButton").onclick = () => {
        index = 0;
        first = true; // reset state so next click starts fresh
        gl.clear(gl.COLOR_BUFFER_BIT);
    };

    // Mouse click → draw rectangle
    canvas.addEventListener("mousedown", function (event) {
        var rect = canvas.getBoundingClientRect();
        var xPos = 2 * (event.clientX - rect.left) / canvas.width - 1;
        var yPos = 2 * (canvas.height - (event.clientY - rect.top)) / canvas.height - 1;
        var pos = vec2(xPos, yPos);

          gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

        if (first) {
            first = false;
            t[0] = pos;
        } else {
            first = true;
            t[2] = pos;
            t[1] = vec2(t[0][0], t[2][1]);
            t[3] = vec2(t[2][0], t[0][1]);

    // Send vertices to GPU
      for (var i = 0; i < 4; i++) {
      gl.bufferSubData(gl.ARRAY_BUFFER, 8 * (index + i), flatten(t[i]));
      }
        index += 4;

    // Colors
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      var color = vec4(colors[cIndex]);
      for (var i = 0; i < 4; ++i) {
      gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index - 4 + i), flatten(color));
            }
        }
      });

    // Render loop
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        for (var i = 0; i < index; i += 4) {
            gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        }
        window.requestAnimationFrame(render);
    }
    render();
}
