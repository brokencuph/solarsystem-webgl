"use strict";
var canvas = document.getElementById("mycanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("webgl2");
window.addEventListener("resize", windowResize, false);
