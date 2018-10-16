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
        const base = shapes[this.type];
        context.moveTo(this.x, this.y);
        context.strokeStyle = this.color;
        context.lineWidth = strokeWidth;
        
        context.save();
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
        context.stroke();
        context.restore();
    }

    fill() {
        const base = shapes[this.type];
        context.moveTo(this.x, this.y);
        context.fillStyle = this.color;
        
        context.save();
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
        context.fill();
        context.restore();
    }
}

let width = 0;
let height = 0;

const shapes = [
    [0,0,1,0,1,1,0,1],
    [0,0,1,0,0.5,1]
];

let canvas = document.createElement("canvas");
let context = canvas.getContext("2d");

let fillDrawables = [];
let strokeDrawables = [];

const strokeWidth = 3;
const backgroundColor = "white";
const colors = [
    // Set up colors that are randomly chosen instead of purely random colors
    "#da2c38",
    "#4392f1",
    "#226f54",
    "#fde74c"
];

const FILLED_AMOUNT = 30;
const STROKED_AMOUNT = 30;

function random(max, min = 0) {
    return (Math.random() * (max - min + 1) + min);
}

function randomColor() {
    if (colors.length > 0)
        return colors[Math.floor(random(colors.length - 1))];

    let color = Math.floor(random(255)).toString(16);
    color += Math.floor(random(255)).toString(16);
    color += Math.floor(random(255)).toString(16);

    return "#" + color;
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

    strokeDrawables = generateDrawables(STROKED_AMOUNT);
    fillDrawables = generateDrawables(FILLED_AMOUNT);

    draw();
    document.body.appendChild(canvas);
}; 


function generateDrawables(amount) {
    let collection = [];
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

        let color = randomColor();
        let type = random(shapes.length - 1);
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
    canvas.width = width = window.innerWidth;
    canvas.height = height = window.innerHeight;
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