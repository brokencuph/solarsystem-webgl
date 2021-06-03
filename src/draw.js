import * as glm from "glm-js"


// begin shader source code
var vertShader = `
#version 430

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

layout (binding=0) uniform sampler2D samp;

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

var fragShader = `
#version 430

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

layout (binding=0) uniform sampler2D samp;
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

var star_vertShader = `
#version 430

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

layout (binding=0) uniform sampler2D samp;
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

var star_fragShader = `
#version 430
in vec2 tc;
out vec4 color;
uniform mat4 mv_matrix;
uniform mat4 proj_matrix;
layout (binding=0) uniform sampler2D samp;

void main(void)
{
	color = texture(samp, tc);
}
`
// end shader source code

/**
 * @var {WebGL2RenderingContext} ctx
 */
var ctx = null

export function setContext(context) {
    ctx = context
}

/**
 * Resize the canvas element and redraw when browser window is resized.
 * @param {HTMLCanvasElement} canvas The canvas element that needs resizing.
 */
export function windowResize(canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    draw(canvas)
}

export function draw() {
    
}