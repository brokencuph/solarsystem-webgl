import * as glm from "glm-js"
import { loadTexture } from "./utils"

export class Planet {
    static omegaScale = 1.0
    /**
     * Construct a Planet object containing data about a planet.
     * @param {number} trackRadius 
     * @param {number} scale 
     * @param {number} period 
     * @param {number} selfPeriod 
     * @param {number} initialPhase 
     * @param {string} textureUrl 
     */
    constructor(trackRadius, scale, period, selfPeriod, initialPhase, textureUrl) {
        this.trackRadius = trackRadius
        this.scale = scale
        this.period = period
        this.selfPeriod = selfPeriod
        this.initialPhase = initialPhase
        this.textureUrl = textureUrl
        this.omega = 2 * Math.PI / this.period
        this.selfAxis = glm.vec3(0.0, 1.0, 0.0)
        this._textureObject = null
    }

    getTextureObject(gl) {
        if (!this._textureObject) {
            this._textureObject = loadTexture(gl, this.textureUrl)
        }
        return this._textureObject
    }

    getScaleMatrix() {
        return glm.scale(glm.mat4(1.0), glm.vec3(this.scale, this.scale, this.scale))
    }

    getTranslationMatrix(time) {
        return glm.translate(glm.mat4(1.0), glm.vec3(
            this.trackRadius * Math.sin(this.initialPhase + this.omega * time * Planet.omegaScale),
            0,
            this.trackRadius * Math.cos(this.initialPhase + this.omega * time * Planet.omegaScale)
        ))
    }

    getRotationMatrix(time) {
        return glm.rotate(glm.mat4(1.0), -time / this.selfPeriod * (2 * Math.PI) * Planet.omegaScale, this.selfAxis)
    }
}