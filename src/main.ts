var canvas = document.getElementById("mycanvas") as HTMLCanvasElement
canvas.width = window.innerWidth
canvas.height = window.innerHeight
var ctx = canvas.getContext("webgl2")
window.addEventListener("resize", windowResize, false)
