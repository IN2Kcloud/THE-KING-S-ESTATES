// BG points -----------------------------------------------------------------
const gridCanvas = document.getElementById("grid-bg");
const ctx = gridCanvas.getContext("2d");

// --- 1. Create a hidden noise buffer ---
const noiseCanvas = document.createElement('canvas');
const noiseCtx = noiseCanvas.getContext('2d');
noiseCanvas.width = 100;
noiseCanvas.height = 100;

function createNoise() {
    const imageData = noiseCtx.createImageData(100, 100);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = data[i+1] = data[i+2] = val; // RGB
        data[i+3] = 25; // Opacity of the grain (keep it low!)
    }
    noiseCtx.putImageData(imageData, 0, 0);
}
createNoise();

let time = 0;

function resize() {
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function draw() {
    time += 0.005;
    
    // Clear canvas
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    // 2. Draw the Gradient
    const centerX = gridCanvas.width / 2 + Math.cos(time) * (gridCanvas.width * 0.3);
    const centerY = gridCanvas.height / 2 + Math.sin(time * 0.8) * (gridCanvas.height * 0.2);
    const baseRadius = Math.max(gridCanvas.width, gridCanvas.height) * 1;
    const pulseRadius = baseRadius + Math.sin(time * 0.5) * 100;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    gradient.addColorStop(0, "#F1D780"); 
    gradient.addColorStop(1, "#000");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);

    // 3. Layer the Noise on top
    // We use 'source-over' or 'overlay' to blend the grain
    ctx.globalCompositeOperation = "source-over"; 
    
    // To animate the noise, we draw the small noise tile at random offsets
    const noiseOffsetX = Math.random() * noiseCanvas.width;
    const noiseOffsetY = Math.random() * noiseCanvas.height;

    // Create a pattern from the noise tile
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.save();
    ctx.translate(noiseOffsetX, noiseOffsetY); // Shifts noise every frame
    ctx.fillStyle = pattern;
    ctx.fillRect(-noiseOffsetX, -noiseOffsetY, gridCanvas.width, gridCanvas.height);
    ctx.restore();

    requestAnimationFrame(draw);
}

draw();


// 1. REGISTER GSAP PLUGINS
gsap.registerPlugin(ScrollTrigger);
// 2. INIT LENIS (Fluid Smooth Scrolling)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
// 3. CUSTOM CURSOR FOLLOWER WITH DELAY
const cursor = document.getElementById("cursor");

let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;

let cursorX = mouseX;
let cursorY = mouseY;

window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function renderCursor() {

    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    gsap.set(cursor, {
        x: cursorX,
        y: cursorY
    });

    requestAnimationFrame(renderCursor);
}

requestAnimationFrame(renderCursor);

// 4. MAGNETIC HOVER EFFECT
const magnetics = document.querySelectorAll(".magnetic");

magnetics.forEach((elem) => {

    elem.addEventListener("mouseenter", () => {

        gsap.to(cursor, {
            scale: 2.5,
            duration: 0.45,
            ease: "power3.out"
        });

    });

    elem.addEventListener("mousemove", (e) => {

        const rect = elem.getBoundingClientRect();

        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(elem, {
            x: x * 0.2,
            y: y * 0.2,
            duration: 0.45,
            ease: "power3.out"
        });

    });

    elem.addEventListener("mouseleave", () => {

        gsap.to(cursor, {
            scale: 1,
            duration: 0.5,
            ease: "power3.out"
        });

        gsap.to(elem, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.4)"
        });

    });

});
// 5. TYPOGRAPHY SPLITTING (SplitType)
const splitText = new SplitType('.split-reveal', { types: 'lines, words, chars' });

// Wrap lines to hide overflow for the wipe reveal
document.querySelectorAll('.split-reveal .line').forEach(line => {
    const wrapper = document.createElement('div');
    wrapper.style.overflow = 'hidden';
    line.parentNode.insertBefore(wrapper, line);
    wrapper.appendChild(line);
});

// ========== 6. MASTER TIMELINE: LOADER TO HERO REVEAL ========== //
// =========================
// LOADER CLOCK
// =========================

const loaderClock = document.getElementById("loader-clock");
const loaderPercent = document.getElementById("loader-percent");
const loaderMessage = document.getElementById("loader-message");
const loaderBar = document.getElementById("loader-bar");

setInterval(() => {
    loaderClock.textContent =
        new Date().toUTCString().split(" ")[4] + " UTC";
}, 1000);

// =========================
// STATUS MESSAGES
// =========================

const messages = [
    "INITIALIZING GRID",
    "VERIFYING PORTFOLIO",
    "LOADING ACQUISITIONS",
    "CONNECTING NETWORK",
    "AUTHENTICATING",
    "READY"
];

let messageIndex = 0;

const messageInterval = setInterval(() => {

    loaderMessage.textContent = messages[messageIndex];

    if (messageIndex < messages.length - 1) {
        messageIndex++;
    }

}, 700);

// =========================
// MARQUEE
// =========================

gsap.to(".loader-track", {
    xPercent: -50,
    repeat: -1,
    ease: "none",
    duration: 18
});

// =========================
// GRID MOTION
// =========================

gsap.to(".loader-bg-grid", {
    backgroundPosition: "60px 60px",
    duration: 12,
    repeat: -1,
    ease: "none"
});

// =========================
// PROGRESS (WAIT FOR REAL LOAD)
// =========================

const progress = { value: 0 };

const progressTween = gsap.to(progress, {

    value: 95,

    duration: 10,

    ease: "none",

    onUpdate() {

        const value = Math.floor(progress.value);

        loaderPercent.textContent =
            value.toString().padStart(2, "0") + "%";

        loaderBar.style.width = value + "%";

    }

});

// =========================
// REVEAL TIMELINE (PAUSED)
// =========================

const tl = gsap.timeline({
    paused: true
});

tl

.to("#loader", {
    clipPath: "inset(0 0 100% 0)",
    duration: 1,
    ease: "expo.inOut"
})

.from(".hero .char", {

    yPercent: 110,

    duration: 1,

    stagger: 0.02,

    ease: "expo.out"

}, "-=0.5")

.from(".hero-author", {

    opacity: 0,

    yPercent: 10,

    duration: 1,

    ease: "back.out(1.7)"

}, "-=0.8");

// =========================
// WAIT FOR PAGE + HERO IMAGE
// =========================

const heroImage = document.querySelector(".hero-image");

Promise.all([
    new Promise(resolve =>
        window.addEventListener("load", resolve, { once: true })
    ),
    heroImage
        ? heroImage.decode().catch(() => {})
        : Promise.resolve()
]).then(() => {

    progressTween.kill();

    clearInterval(messageInterval);

    loaderMessage.textContent = "READY";

    gsap.to(progress, {

        value: 100,

        duration: 0.6,

        ease: "power3.out",

        onUpdate() {

            const value = Math.floor(progress.value);

            loaderPercent.textContent =
                value.toString().padStart(2, "0") + "%";

            loaderBar.style.width = value + "%";

        },

        onComplete() {

            tl.play();

        }

    });

});

// 7. SCROLLTRIGGER INTERACTIONS
// Marquees (Horizontal scroll linked to vertical scroll)
gsap.to('#marquee-1', {
    xPercent: -50,
    ease: "none",
    scrollTrigger: {
        trigger: '#marquee-1',
        start: "top bottom",
        end: "bottom top",
        scrub: 1
    }
});

gsap.to('#marquee-2', {
    xPercent: 20, // Reverses direction
    ease: "none",
    scrollTrigger: {
        trigger: '#marquee-2',
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5
    }
});
// General Fade Ups for Body Text
gsap.utils.toArray('.fade-up').forEach(element => {
    gsap.from(element, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: element,
            start: "top 85%",
        }
    });
});
// Manifesto Header Reveal
gsap.utils.toArray('.manifesto-title .char').forEach(char => {
    gsap.from(char, {
        yPercent: 100,
        duration: 0.8,
        stagger: 0.05,
        ease: "expo.out",
        scrollTrigger: {
            trigger: '.manifesto',
            start: "top 70%",
        }
    });
});
// 8. AMBIENT "CONSTANT LIFE" ANIMATION
// Gentle breathing and color shift on specific script words
gsap.to('.ambient-breathe', {
    scale: 1.05,
    textShadow: "0px 0px 15px rgba(241,215,128,0.5)",
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

// ========== NAV ==========//

// Shrink nav while scrolling
ScrollTrigger.create({
    start:100,
    end:99999,
    onUpdate:self=>{
        gsap.to(".top-nav",{
            scale:self.scroll()>0?0.92:1,
            padding:self.scroll()>0?"0.8rem 1.8rem":"1rem 2rem",
            duration:.3,
            overwrite:true
        });
    }
});

// ========== HERO ==========//
const img=document.querySelector(".hero-image");

window.addEventListener("mousemove",(e)=>{

    const x=(e.clientX/innerWidth-.5)*16;
    const y=(e.clientY/innerHeight-.5)*16;

    gsap.to(img,{
        rotateY:x,
        rotateX:-y,
        duration:1.2,
        ease:"power3.out"
    });

});

gsap.to(".hero-marquee-track",{
    xPercent:-33.333,
    duration:120,
    ease:"none",
    repeat:-1
});

// Scroll indicator

gsap.fromTo(".scroll-dot",

    {
        y:0,
        opacity:1
    },

    {

        y:80,

        opacity:0,

        duration:1.4,

        ease:"power2.in",

        repeat:-1

    }

);

gsap.to(".scroll-text",{

    opacity:.35,

    duration:1,

    repeat:-1,

    yoyo:true,

    ease:"sine.inOut"

});

gsap.to(".scroll-indicator",{

    y:8,

    duration:1.8,

    repeat:-1,

    yoyo:true,

    ease:"sine.inOut"

});

// =========================
// HERO AMBIENT ANIMATION
// =========================

gsap.to(".hero-image", {
    scale: 1.04,
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

gsap.to(".hero-image", {
    rotation: 2,
    duration: 9,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

// ========== Manifesto ==========//

const manifestoTL = gsap.timeline({
    scrollTrigger:{
        trigger:".manifesto",
        start:"top 60%",
        end:"bottom 65%",
        scrub:1
    }
});

manifestoTL

.from(".manifesto-title .char",{
    xPercent:-120,
    rotateY:-90,
    opacity:0,
    stagger:0.03,
    ease:"power4.out"
})

.to(".manifesto-divider",{
    scaleX:1,
    duration:1,
    ease:"power3.out"
},"<0.15")

.from(".manifesto-description",{
    y:80,
    opacity:0,
    duration:1
},"<0.1")

.to(".manifesto-title span",{
    scale:1.02,
    textShadow:"0 0 35px rgba(241,215,128,.45)",
    duration:1
},"<");

gsap.to(".ambient-breathe",{
    y:-4,
    scale:1.06,
    duration:2,
    repeat:-1,
    yoyo:true,
    ease:"sine.inOut"
});

const front=document.querySelector(".front");

for(let y=0;y<18;y++){

    for(let x=0;x<5;x++){

        const w=document.createElement("div");

        w.className="window";

        w.style.left=`${18+x*30}px`;

        w.style.top=`${15+y*22}px`;

        front.appendChild(w);

    }

}

gsap.to(".tower-track",{
    xPercent:-50,
    duration:12,
    ease:"none",
    repeat:-1
});

gsap.to(".tower",{

    y:-20,

    rotationY:360,

    duration:28,

    repeat:-1,

    ease:"none"

});

gsap.to(".tower",{

    rotationX:5,

    duration:5,

    yoyo:true,

    repeat:-1,

    ease:"sine.inOut"

});

gsap.to(".tower",{

    scale:1.03,

    duration:4,

    yoyo:true,

    repeat:-1,

    ease:"sine.inOut"

});

gsap.to(".shadow",{

    scale:.8,

    opacity:.45,

    duration:4,

    repeat:-1,

    yoyo:true,

    ease:"sine.inOut"

});

gsap.to(".tower",{

    filter:"drop-shadow(0 0 35px rgba(241,215,128,.45))",

    duration:3,

    repeat:-1,

    yoyo:true,

    ease:"sine.inOut"

});


// ========== Vision ==========//

const visionTL = gsap.timeline({
    scrollTrigger:{
        trigger:".vision",
        start:"top 55%",
        end:"bottom 60%",
        scrub:1
    }
});

visionTL

.from(".vision-title .char",{
    yPercent:120,
    rotateX:-90,
    opacity:0,
    stagger:0.03,
    ease:"power4.out"
})

.to(".vision::before",{
    width:120,
    duration:.5
},0)

.to(".vision-divider",{
    scaleX:1,
    duration:1,
    ease:"power3.out"
},"<0.2")

.from(".vision-lead",{
    x:-120,
    opacity:0,
    duration:1
},"<0.2")

.from(".vision-description",{
    x:120,
    opacity:0,
    duration:1
},"<")

.to(".vision-title span",{
    textShadow:"0 0 40px rgba(241,215,128,.45)",
    scale:1.02,
    duration:1
},"<");

// ========== FOUNDATIONS ==========//

new SplitType(".legacy-title",{
    types:"lines,words,chars"
});

const legacyTL = gsap.timeline({

    scrollTrigger:{
        trigger:".legacy",
        start:"top 65%",
        end:"bottom 70%",
        scrub:1
    }

});

legacyTL

.from(".legacy-title .char",{

    yPercent:120,

    rotateX:-90,

    opacity:0,

    stagger:.03,

    ease:"power4.out"

})

.from(".legacy-line",{

    scaleX:0,

    transformOrigin:"left",

    duration:1

},"<")

.from(".legacy-item",{

    y:120,

    opacity:0,

    stagger:.18,

    duration:1

},"<.2");

gsap.to(".legacy-word",{

    y:-120,

    ease:"none",

    scrollTrigger:{
        trigger:".legacy",
        start:"top bottom",
        end:"bottom top",
        scrub:1.5
    }

});

gsap.utils.toArray(".legacy-track").forEach((track) => {

    gsap.set(track, {
        xPercent: 0
    });

    gsap.to(track, {
        xPercent: -50,
        duration: 20,
        ease: "none",
        repeat: -1
    });

});

// ========== FOOTER ==========//

gsap.to(".footer-track",{

    xPercent:-50,

    duration:25,

    ease:"none",

    repeat:-1

});

const statuses = [
    "ONLINE",
    "ACQUIRED",
    "TRACKING",
    "SCANNING",
    "SECURED",
    "ACTIVE"
];

gsap.utils.toArray(".intel-value").forEach(el=>{

    gsap.to(el,{

        opacity:.45,

        duration:1.2,

        repeat:-1,

        yoyo:true,

        ease:"sine.inOut",

        delay:Math.random()*2

    });

});

setInterval(()=>{

    document.querySelector('[data-type="lot"]').textContent =
        `LOT ${gsap.utils.random(100,999,1)}`;

    document.querySelector('[data-type="build"]').textContent =
        `BUILD ${gsap.utils.random(10,999,1)}`;

    document.querySelector('[data-type="asset"]').textContent =
        `ASSET ${gsap.utils.random(100,999,1)}`;

    document.querySelector('[data-type="capital"]').textContent =
        `$${gsap.utils.random(10,250,1)}M`;

    document.querySelector('[data-type="north"]').textContent =
        `N ${gsap.utils.random(20,60,1)}°`;

    document.querySelector('[data-type="west"]').textContent =
        `W ${gsap.utils.random(60,120,1)}°`;

    document.querySelector('[data-type="status"]').textContent =
        statuses[Math.floor(Math.random()*statuses.length)];

},1800);

function flash(el){
    gsap.fromTo(el,
        {
            color:"#F1D780",
            opacity:1
        },
        {
            color:"rgba(241,215,128,.22)",
            opacity:.45,
            duration:.6
        }
    );
}

function updateClock(){

    const now=new Date();

    document.querySelector(".clock-time").textContent=
        now.toUTCString().split(" ")[4];

}

updateClock();

setInterval(updateClock,1000);

const feed=document.querySelector(".feed-message");

const acquisitions=[

"PROPERTY ACQUIRED • CHICAGO • $18.4M",

"LAND SECURED • DALLAS • 42 ACRES",

"NEW PARTNERSHIP • TORONTO",

"MULTI-FAMILY • ATLANTA • CLOSED",

"OFF-MARKET DEAL • MIAMI",

"CAPITAL DEPLOYED • $12.8M",

"PORTFOLIO EXPANDED • PHOENIX",

"GRID ACTIVE • NORTH AMERICA"

];

function updateFeed(){

    gsap.to(feed,{

        y:-20,

        opacity:0,

        duration:.35,

        ease:"power2.in",

        onComplete(){

            feed.textContent=
                acquisitions[Math.floor(Math.random()*acquisitions.length)];

            gsap.fromTo(feed,
            {
                y:20,
                opacity:0
            },
            {
                y:0,
                opacity:1,
                duration:.6,
                ease:"power3.out"
            });

        }

    });

}

updateFeed();

setInterval(updateFeed,3500);

function flashFeed(){

    gsap.fromTo(".feed",{

        borderColor:"rgba(241,215,128,.8)",

        boxShadow:"0 0 40px rgba(241,215,128,.25)"

    },

    {

        borderColor:"rgba(241,215,128,.15)",

        boxShadow:"0 0 0 rgba(241,215,128,0)",

        duration:.8

    });

}

flashFeed();

// Breathing nodes

gsap.to(".node circle",{

    scale:1.25,

    duration:2,

    stagger:{
        each:.2,
        repeat:-1,
        yoyo:true
    },

    ease:"sine.inOut"

});

function travel(signal,path){

    gsap.set(signal,{
        motionPath:null
    });

    gsap.to(signal,{

        duration:3,

        repeat:-1,

        ease:"none",

        motionPath:{
            path:path,
            align:path,
            autoRotate:false
        }

    });

}

travel(".s1",".network-line:nth-of-type(1)");
travel(".s2",".network-line:nth-of-type(2)");
travel(".s3",".network-line:nth-of-type(3)");

gsap.to(".s1",{

    attr:{
        cx:200,
        cy:130
    },

    duration:2,

    repeat:-1,

    ease:"none"

});

gsap.set(".s1",{
    attr:{
        cx:70,
        cy:130
    }
});

gsap.to(".s2",{

    attr:{
        cx:330,
        cy:130
    },

    duration:2,

    repeat:-1,

    ease:"none"

});

gsap.set(".s2",{
    attr:{
        cx:200,
        cy:130
    }
});

gsap.to(".s3",{

    attr:{
        cx:200,
        cy:250
    },

    duration:2,

    repeat:-1,

    ease:"none"

});

gsap.set(".s3",{
    attr:{
        cx:200,
        cy:130
    }
});

const cities=document.querySelectorAll(".node");

setInterval(()=>{

    const city=cities[Math.floor(Math.random()*cities.length)];

    gsap.fromTo(city.querySelector("circle"),

    {
        fill:"#F1D780",
        scale:1.8,
        filter:"drop-shadow(0 0 15px #F1D780)"
    },

    {
        fill:"#111",
        scale:1,
        duration:1.2
    });

},2500);