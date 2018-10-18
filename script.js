/**
 * User Settings
 */

const strokeWidth = 3;
const backgroundColor = "transparent";
const colors = [
    // Set up colors that are randomly chosen instead of purely random colors
    "000000"
];

const resizeToBrowserWidth = false;
let width = 1920;
let height = 1080;

const FILLED_AMOUNT = 30;
const STROKED_AMOUNT = 30;

const canCreateFilledCircles = true;
const canCreateStrokedCircles = false;

const canColorsHaveAlpha = true; // Probably should change this name, it sucks

const minAlpha = 0;
const maxAlpha = 255; // 1% ~~ 2.56;

/**
 * Don't edit the file past this point as it could make the script stop from working
 */

class Drawable {
    constructor(x, y, rotation, color, size, type) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.color = color;
        this.size = size;
        this.type = type;
    }
    
    stroke() {
        context.moveTo(this.x, this.y);
        context.strokeStyle = this.color;
        context.lineWidth = strokeWidth;
        
        if(this.type === shapes.length) { // type == circle, which can't be defined properly in the shape array
        context.ellipse(this.x, this.y, this.size, this.size, this.rotation, 0, 2 * Math.PI); // We leave in rotation so we can leave it open to have different x and y sizes.
        }
        else {
            context.save();
            const base = shapes[this.type];
            context.translate(this.x + this.size / 2, this.y + this.size / 2);
            context.rotate(this.rotation);
    
            context.beginPath();
            for (let i = 0; i < base.length; i += 2) {
                
                /**
                 * Since we translate the canvas towards the center anchor of our shape ((x + size / 2, y + size / 2) == origin)
                 * we have to favor in the size, as if we wouldn't subtract half of it then the shape would be drawn with
                 * an anchor to the lower left.
                 * 
                 * The rotation however only works properly if we anchor the shape to the center
                 */
                let px = base[i] * this.size - (this.size / 2);
                let py = base[i + 1] * this.size - (this.size / 2);
                
                context.lineTo(px, py);
            }
            context.closePath();
        }
        context.restore();
        context.stroke();
    }

    fill() {
        context.moveTo(this.x, this.y);
        context.fillStyle = this.color;

        if(this.type === shapes.length) { // type == circle, which can't be defined properly in the shape array
            context.ellipse(this.x, this.y, this.size, this.size, this.rotation, 0, 2 * Math.PI); // We leave in rotation so we can leave it open to have different x and y sizes.
        }
        else {
            context.save();
            const base = shapes[this.type];
            context.translate(this.x + this.size / 2, this.y + this.size / 2);
            context.rotate(this.rotation);
    
            context.beginPath();
            for (let i = 0; i < base.length; i += 2) {
                
                /**
                 * Since we translate the canvas towards the center anchor of our shape ((x + size / 2, y + size / 2) == origin)
                 * we have to favor in the size, as if we wouldn't subtract half of it then the shape would be drawn with
                 * an anchor to the lower left.
                 * 
                 * The rotation however only works properly if we anchor the shape to the center
                 */
                let px = base[i] * this.size - (this.size / 2);
                let py = base[i + 1] * this.size - (this.size / 2);
                
                context.lineTo(px, py);
            }
            context.closePath();
        }
        context.fill();
        context.restore();
    }
}


const shapes = [
    [0,0,1,0,1,1,0,1],
    [0,0,1,0,0.5,1]
];

let canvas = document.createElement("canvas");
let context = canvas.getContext("2d");

let fillDrawables = [];
let strokeDrawables = [];

function random(max, min = 0) {
    return (Math.random() * (max - min + 1) + min);
}

function randomColor() {
    let color = "#";
    if (colors.length > 0) {
        color += colors[Math.floor(random(colors.length - 1))];
    }
    else {
        color += Math.floor(random(255)).toString(16);
        color += Math.floor(random(255)).toString(16);
        color += Math.floor(random(255)).toString(16);
    }
    if(canColorsHaveAlpha) {
        color += Math.floor(random(maxAlpha, minAlpha)).toString(16);
    }
    return color;
}

window.onload = function() {
    context.translate(width / 2, height / 2);
    /**
     * Right now we're focusing on the mid point of the canvas to calculate everything.
     * This is due to the fact of the randomness being pseudo random leaving us with a
     * result where the calculated x and y values are mostly somewhere between width / 2 and -width / 2 or height / 2 and -height / 2.
     * 
     * If we would use the standard translation point we would have a distribution that favors the left side.
     * 
     * The best case would be either an even distribution or a distribution that favors numbers
     * that are close to either width and -width / height and -height
     */

    
    context.fillStyle = backgroundColor;
    context.fillRect (-width / 2, -height / 2, width, height);

    strokeDrawables = generateDrawables(STROKED_AMOUNT, canCreateStrokedCircles);
    fillDrawables = generateDrawables(FILLED_AMOUNT, canCreateFilledCircles);

    draw();
    document.body.appendChild(canvas);
}; 

function generateDrawables(amount, canCreateCircles) {
    let collection = [];

    let shapeTypeAmount = shapes.length - 1;
    if (canCreateCircles)
        shapeTypeAmount++;

    for(let i = 0; i < amount; i++) {
        let size = Math.floor(random(75, 15));
        let x = random(width / 2, -width / 2) - size / 2;
        let y = random(height / 2, -height / 2) - size / 2;

        /**
         * We calculate x and y this way so that if we have say
         * size = 30
         * that the middle point of the shape is at the origin if the result of the random is 0.
         * 
         * This is because in Drawable.draw(); we set the center of the canvas to the object so we can
         * rotate it. This is just a simple way of doing it. We could ignore the -size / 2 however this
         * could also create objects that are fully off the screen.
         * 
         * With this "half approach" we can gurantee that atleast parts of the object are seen on screen under
         * most circumstances. (Edge Cases Triangles at x Degree, when they become Parallel to the side).
         */

        let rotation = random(360);

        let type = random(shapeTypeAmount);
        collection.push(new Drawable(
            Math.floor(x),
            Math.floor(y),
            Math.floor(rotation) * Math.PI / 180, // Degree to Radians, the context.rotate function takes radians
            randomColor(),
            size,
            Math.floor(type)
        ));
    }
    return collection;
}

window.addEventListener("resize", resizeCanvas, false);
resizeCanvas();

function resizeCanvas(){
    if (resizeToBrowserWidth) {
        canvas.width = width = window.innerWidth;
        canvas.height = height = window.innerHeight;
    }
    else {
        canvas.width = width;
        canvas.height = height;
    }
    context = canvas.getContext("2d");
    draw();
};

function draw(){
    strokeDrawables.forEach(element => {
        element.stroke();
    });
    fillDrawables.forEach(element => {
        element.fill();
    });
}