import * as glm from "glm-js"

/**
 * Convert from degree to radian.
 * @param {number} degrees The degree value.
 * @returns {number} The radian value.
 */
function toRadians(degrees) {
    return (degrees * 2.0 * Math.PI) / 360.0
}

export class Sphere {
    constructor(prec) {
        if (!prec) {
            prec = 48
        }
        this.numVertices = (prec + 1) * (prec + 1)
        this.numIndices = prec * prec * 6

        // prepare array space
        this.vertices = []
        for (let i = 0; i < this.numVertices; i++) {
            this.vertices.push(glm.vec3())
        }
        this.texCoords = []
        for (let i = 0; i < this.numVertices; i++) {
            this.texCoords.push(glm.vec2())
        }
        this.normals = []
        for (let i = 0; i < this.numVertices; i++) {
            this.normals.push(glm.vec3())
        }
        this.tangents = []
        for (let i = 0; i < this.numVertices; i++) {
            this.tangents.push(glm.vec3())
        }
        this.indices = []
        for (let i = 0; i < this.numIndices; i++) {
            this.indices.push(0)
        }
        const { sin, cos, asin, abs } = Math
        // fill the arrays with real values
        for (let i = 0; i <= prec; i++) {
            for (let j = 0; j <= prec; j++) {
                const y = cos(toRadians(180.0 - i * 180.0 / prec));
                const x = -cos(toRadians(j*360.0 / prec))*abs(cos(asin(y)));
                const z = sin(toRadians(j*360.0 / (prec)))*abs(cos(asin(y)));
                this.vertices[i*(prec+1)+j] = glm.vec3(x, y, z)
                this.texCoords[i*(prec+1)+j] = glm.vec2(j / prec, i / prec)
                this.normals[i*(prec+1)+j] = glm.vec3(x, y, z)
                if (((x == 0) && (y == 1) && (z == 0)) || ((x == 0) && (y == -1) && (z == 0))) {
                    this.tangents[i*(prec + 1) + j] = glm.vec3(0.0, 0.0, -1.0);
                }
                else {
                    this.tangents[i*(prec + 1) + j] = glm.cross(glm.vec3(0.0, 1.0, 0.0), glm.vec3(x, y, z));
                }    
            }
        }
        // calculate triangle indices
        for (let i = 0; i<prec; i++) {
            for (let j = 0; j<prec; j++) {
                this.indices[6 * (i*prec + j) + 0] = i*(prec + 1) + j;
                this.indices[6 * (i*prec + j) + 1] = i*(prec + 1) + j + 1;
                this.indices[6 * (i*prec + j) + 2] = (i + 1)*(prec + 1) + j;
                this.indices[6 * (i*prec + j) + 3] = i*(prec + 1) + j + 1;
                this.indices[6 * (i*prec + j) + 4] = (i + 1)*(prec + 1) + j + 1;
                this.indices[6 * (i*prec + j) + 5] = (i + 1)*(prec + 1) + j;
            }
        }
    }
}