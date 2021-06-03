import * as glm from "glm-js"
import * as glutils from "./utils"
import { Sphere } from "./sphere"
import { Planet } from "./planet"


// begin shader source code
var vertShader = `#version 300 es

layout (location=0) in vec3 position;
layout (location=1) in vec2 texCoord;
layout (location=2) in vec3 vertNormal;
out vec2 tc;

out vec3 varyingNormal;
out vec3 varyingLightDir;
out vec3 varyingVertPos;
out vec3 varyingHalfVector;

struct PositionalLight
{	vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec3 position;
};
struct Material
{	vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    float shininess;
};

uniform vec4 globalAmbient;
uniform PositionalLight light;
uniform mat4 mv_matrix;
uniform mat4 proj_matrix;
uniform mat4 norm_matrix;

uniform sampler2D samp;

void main(void)
{
    varyingVertPos = (mv_matrix * vec4(position,1.0)).xyz;
    varyingLightDir = light.position - varyingVertPos;
    varyingNormal = (norm_matrix * vec4(vertNormal,1.0)).xyz;
    
    varyingHalfVector =
        normalize(normalize(varyingLightDir)
        + normalize(-varyingVertPos)).xyz;
    gl_Position = proj_matrix * mv_matrix * vec4(position,1.0);
    tc = texCoord;
} 

`

var fragShader = `#version 300 es

precision highp float;

in vec3 varyingNormal;
in vec3 varyingLightDir;
in vec3 varyingVertPos;
in vec3 varyingHalfVector;

struct PositionalLight
{	vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec3 position;
};

uniform vec4 globalAmbient;
uniform PositionalLight light;
uniform mat4 mv_matrix;
uniform mat4 proj_matrix;
uniform mat4 norm_matrix;

uniform sampler2D samp;
//in vec4 varyingColor;
in vec2 tc;
out vec4 color;

void main(void)
{		
    vec3 L = normalize(varyingLightDir);
    vec3 N = normalize(varyingNormal);
    vec3 V = normalize(-varyingVertPos);
    
    // get the angle between the light and surface normal:
    float cosTheta = dot(L,N);
    
    // halfway vector varyingHalfVector was computed in the vertex shader,
    // and interpolated prior to reaching the fragment shader.
    // It is copied into variable H here for convenience later.
    vec3 H = normalize(varyingHalfVector);
    
    // get angle between the normal and the halfway vector
    float cosPhi = dot(H,N);

    // compute ADS contributions (per pixel):
    vec3 ambient = ((globalAmbient) + (light.ambient)).xyz;
    vec3 diffuse = light.diffuse.xyz * max(cosTheta,0.0);
    vec3 specular = light.specular.xyz * pow(max(cosPhi,0.0), 3.0);
    vec3 textureColor = (texture(samp, tc)).xyz;
    color = vec4(textureColor * (ambient + diffuse), 1.0);
    //color = vec4(1.0, 0.0, 0.0, 1.0);
}

`

var star_vertShader = `#version 300 es
layout (location=0) in vec3 pos;
layout (location=1) in vec2 texCoord;

out highp vec2 tc;
uniform mat4 mv_matrix;
uniform mat4 proj_matrix;
uniform sampler2D samp;

void main(void)
{
	gl_Position = proj_matrix * mv_matrix * vec4(pos, 1.0);
	tc = texCoord;
}
`

var star_fragShader = `#version 300 es
precision highp float;
in highp vec2 tc;
out vec4 color;
uniform mat4 mv_matrix;
uniform mat4 proj_matrix;
uniform sampler2D samp;

void main(void)
{
    // color = vec4(tc, 0.0, 1.0);
    color = vec4(texture(samp, tc).rgb, 1.0);
    // color = vec4(1.0, 0.0, 0.0, 1.0);
}
`
// end shader source code

/**
 * @type {?WebGL2RenderingContext}
 */
var gl = null

/**
 * @type {WebGLProgram}
 */
var renderingProgram

/**
 * @type {WebGLProgram}
 */
var starRenderingProgram

/**
 * @type {WebGLVertexArrayObject}
 */
var vao

/**
 * @type {WebGLBuffer[]}
 */
var vbo = [null, null, null]

/**
 * @type {WebGLTexture}
 */
var sunTexture

/**
 * @type {WebGLTexture}
 */
var moonTexture

/**
 * @type {WebGLTexture}
 */
var starTexture

var mySphere = new Sphere()
var myPlanets = [
    new Planet(2.5, 0.38, 5.0, 20.0, 3.14, "textures/mercury.bmp"),
    new Planet(4.67, 0.94, 10.0, 100.0, 3.14, "textures/venus.bmp"),
    // earth separated
    new Planet(9.84, 0.53, 30.0, 5.14, 3.14, "textures/mars.bmp"),
    new Planet(33.62, 11.2, 177.0, 2.07, 3.14, "textures/jupiter.bmp"),
    new Planet(61.9, 9.44, 300.0, 2.238, 3.14, "textures/sature.bmp"),
    new Planet(124.03, 4.0, 400.0, 3.598, 3.14, "textures/uranus.bmp"),
    new Planet(194.09, 3.88, 500.0, 3.368, 3.14, "textures/neptune.bmp")
]
var myEarth = new Planet(6.46, 1.0, 15.0, 5.0, 3.14, "textures/earth.bmp")

var aspect, pMat
var cameraX, cameraY, cameraZ
var xrot = 0.0, yrot = 0.0

/**
 * Set the context field of this module.
 * @param {WebGL2RenderingContext} context The WebGL2 Rendering Context of the canvas.
 */
export function setContext(context) {
    gl = context
}

/**
 * Resize the canvas element and redraw when browser window is resized.
 */
export function windowResize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    aspect = window.innerWidth / window.innerHeight
    pMat = glm.perspective(1.0472, aspect, 0.1, 1000.0)
}

function setupVertices() {
    const { indices: ind, vertices: vert, texCoords: tex, normals } = mySphere
    const pvalues = [], tvalues = [], nvalues = []
    const { numIndices } = mySphere
    for (let i = 0; i < numIndices; i++) {
        pvalues.push(vert[ind[i]].x)
        pvalues.push(vert[ind[i]].y)
        pvalues.push(vert[ind[i]].z)

        tvalues.push(tex[ind[i]].x)
        tvalues.push(tex[ind[i]].y)

        nvalues.push(normals[ind[i]].x)
        nvalues.push(normals[ind[i]].y)
        nvalues.push(normals[ind[i]].z)
    }
    const f_pvalues = new Float32Array(pvalues)
    const f_tvalues = new Float32Array(tvalues)
    const f_nvalues = new Float32Array(nvalues)
    vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    for (let i in vbo) {
        vbo[i] = gl.createBuffer()
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[0])
    gl.bufferData(gl.ARRAY_BUFFER, f_pvalues, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[1])
    gl.bufferData(gl.ARRAY_BUFFER, f_tvalues, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[2])
}

export function init() {
    if (!gl) {
        throw "Rendering context is not set."
    }
    let vShader = glutils.compileShader(gl, vertShader, gl.VERTEX_SHADER)
    let fShader = glutils.compileShader(gl, fragShader, gl.FRAGMENT_SHADER)
    renderingProgram = glutils.createProgram(gl, vShader, fShader)
    vShader = glutils.compileShader(gl, star_vertShader, gl.VERTEX_SHADER)
    fShader = glutils.compileShader(gl, star_fragShader, gl.FRAGMENT_SHADER)
    starRenderingProgram = glutils.createProgram(gl, vShader, fShader)
    aspect = window.innerWidth / window.innerHeight
    pMat = glm.perspective(1.0472, aspect, 0.1, 1000.0)
    cameraX = 0.0, cameraY = 0.0, cameraZ = 20.0
    setupVertices()
    sunTexture = glutils.loadTexture(gl, "textures/sunmap.jpg")
    moonTexture = glutils.loadTexture(gl, "textures/moon.bmp")
    starTexture = glutils.loadTexture(gl, "textures/starfield2048.jpg")
    myEarth.selfAxis = glm.vec3(0.407, 0.914, 0.0)
}

export function draw(currentTime) {
    // console.log("draw")
    if (!gl) {
        throw "Rendering context is not set."
    }
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // draw the star sphere
    gl.useProgram(starRenderingProgram)
    const mvLoc = gl.getUniformLocation(starRenderingProgram, "mv_matrix")
    const projLoc = gl.getUniformLocation(starRenderingProgram, "proj_matrix")
    const sampLoc = gl.getUniformLocation(starRenderingProgram, "samp")
    const newCamera = glm.rotate(glm.mat4(1.0), -currentTime / 10.0 + yrot, glm.vec3(0.0, 1.0, 0.0))
        ['*'](glm.rotate(glm.mat4(1.0), xrot, glm.vec3(1.0, 0.0, 0.0)))
        ['*'](glm.vec4(cameraX, cameraY, cameraZ, 1.0))
    const vMat = glm.lookAt(newCamera.xyz, glm.vec3(0.0, 0.0, 0.0), glm.vec3(0.0, 1.0, 0.0))
    const mMat = glm.translate(glm.mat4(1.0), newCamera.xyz)
    const mvMat = vMat['*'](mMat)
    gl.uniformMatrix4fv(mvLoc, false, mvMat.elements)
    gl.uniformMatrix4fv(projLoc, false, pMat.elements)
    gl.uniform1i(sampLoc, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[0])
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo[1])
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(1)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, starTexture)
    gl.enable(gl.CULL_FACE)
    gl.frontFace(gl.CW)
    gl.disable(gl.DEPTH_TEST)
    gl.drawArrays(gl.TRIANGLES, 0, mySphere.numIndices)
    gl.enable(gl.DEPTH_TEST)
}