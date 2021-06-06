# solarsystem-webgl
This repository is a WebGL2 port of my [OpenGLSolarSystem](https://github.com/brokencuph/OpenGLSolarSystem). It is based on HTML5 (for canvas support), [WebGL2](https://www.khronos.org/registry/webgl/specs/latest/2.0/) and [Webpack](https://webpack.js.org/) technologies. Besides, [glm-js](https://humbletim.github.io/glm-js/) is used to handle the matrix calculations.

The purpose is mainly to test and learn the differences between traditional OpenGL and *WebGL* (or *OpenGL ES*). Anyway, it is exciting to have 3D effects in browsers, in different kinds of platforms and devices.

# Demo
[Link](https://brokencuph.github.io/dist) (manually uploaded, may not be up-to-date)

# Build
Follow the normal procedure for building a [Webpack](https://webpack.js.org/guides/getting-started/) javascript project.

Something like
```
npm install --dev
npm run build
```
may be helpful, but details may differ due to your dev environment. :-)

# Implemented features
- Draw the starfield, the sun, all the planets and the moon basically correct, with lighting
- Interactive part (drag/scroll/zoom to move the camera)

# Not yet finished
- Free roam