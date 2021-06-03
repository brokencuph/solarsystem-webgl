import * as draw from "./draw"

var canvas = document.getElementById("mycanvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
var ctx = canvas.getContext("webgl2")
window.addEventListener("resize", draw.windowResize.bind(canvas), false)
draw.setContext(ctx)
while (true) {
    draw.draw(canvas)
}