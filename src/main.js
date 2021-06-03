import * as draw from "./draw"

var canvas = document.getElementById("mycanvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
var ctx = canvas.getContext("webgl2")
window.addEventListener("resize", draw.windowResize.bind(canvas), false)
draw.setContext(ctx)
draw.init()
var initialTime = (new Date).getTime()
function redraw() {
    draw.draw(((new Date).getTime() - initialTime) / 1000)
    setTimeout(redraw, 10)
}
setTimeout(redraw, 10)
