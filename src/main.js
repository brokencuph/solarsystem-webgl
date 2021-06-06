import * as draw from "./draw"

var canvas = document.getElementById("mycanvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
var ctx = canvas.getContext("webgl2")
window.addEventListener("resize", draw.windowResize.bind(canvas), false)
function adjustZ(amt) {
    const new_cameraZ = draw.cameraZ + amt
    if (new_cameraZ > 1.0) {
        draw.cameraZ = new_cameraZ
    }
}
canvas.addEventListener("wheel", ev => {
    adjustZ(0.1 * ev.deltaY)
})
var dragEnabled = false
function adjustXYRot(xAmt, yAmt) {
    const newXrot = draw.xrot + yAmt * (3.14 / 180)
    if (newXrot > -1.5 && newXrot < 1.5) {
        draw.xrot = newXrot
    }
    draw.yrot += -xAmt * (3.14 / 180)
}
canvas.addEventListener("mousedown", ev => {
    dragEnabled = true
})
canvas.addEventListener("mouseup", ev => {
    dragEnabled = false
})
canvas.addEventListener("mousemove", ev => {
    if (dragEnabled) {
        adjustXYRot(ev.movementX, ev.movementY)
    }
})

function copyTouch({identifier, pageX, pageY}) {
    return {identifier, pageX, pageY}
}

function ongoingTouchIndexById(identifier) {
    for (let i = 0; i < ongoingTouches.length; i++) {
        if (ongoingTouches[i].identifier == identifier) {
            return i
        }
    }
    return -1
}

var ongoingTouches = []
canvas.addEventListener("touchstart", ev => {
    ev.preventDefault()
    const touches = ev.changedTouches
    for (let i = 0; i < touches.length; i++) {
        ongoingTouches.push(copyTouch(touches[i]))
    }
})
canvas.addEventListener("touchend", ev => {
    ev.preventDefault()
    const touches = ev.changedTouches
    for (let i = 0; i < touches.length; i++) {
        const idx = ongoingTouchIndexById(touches[i].identifier)
        if (idx != -1) {
            ongoingTouches.splice(idx, 1) // remove the touch
        }
    }
})
canvas.addEventListener("touchcancel", ev => {
    ev.preventDefault()
    const touches = ev.changedTouches
    for (let i = 0; i < touches.length; i++) {
        const idx = ongoingTouchIndexById(touches[i].identifier)
        if (idx != -1) {
            ongoingTouches.splice(idx, 1) // remove the touch
        }
    }
})
canvas.addEventListener("touchmove", ev => {
    ev.preventDefault()
    const touches = ev.changedTouches
    if (ongoingTouches.length <= 1) {
        const idx = ongoingTouchIndexById(touches[0].identifier)
        if (idx != -1) {
            adjustXYRot(touches[0].pageX - ongoingTouches[idx].pageX, 
                touches[0].pageY - ongoingTouches[idx].pageY)
        }
    } else {
        for (let i = 0; i < touches.length; i++) {
            const idx = ongoingTouchIndexById(touches[i].identifier)
            if (idx == -1 || idx == 0) {
                continue
            }
            const lastDistance = Math.hypot(ongoingTouches[idx].pageX - ongoingTouches[0].pageX, 
                ongoingTouches[idx].pageY - ongoingTouches[0].pageY)
            const distance = Math.hypot(touches[i].pageX - ongoingTouches[0].pageX,
                touches[i].pageY - ongoingTouches[0].pageY)
            adjustZ(lastDistance - distance)
            break
        }
    }
    for (let i = 0; i < touches.length; i++) {
        const idx = ongoingTouchIndexById(touches[i].identifier)
        if (idx != -1) {
            ongoingTouches.splice(idx, 1, copyTouch(touches[i]))
        }
    }
})
draw.setContext(ctx)
draw.init()
var initialTime = (new Date).getTime()
function redraw() {
    draw.draw(((new Date).getTime() - initialTime) / 1000)
    setTimeout(redraw, 10)
}
setTimeout(redraw, 10)
