const ocean = document.getElementById('ocean');
const foodParticles = document.getElementById('foodParticles');
const creatures = [];
let paused = false;

const creatureTemplates = {
    fish: document.getElementById('fish-template'),
    jellyfish: document.getElementById('jellyfish-template'),
    octopus: document.getElementById('octopus-template'),
    shark: document.getElementById('shark-template'),
    turtle: document.getElementById('turtle-template')
};

const creatureBehaviors = {
    fish: { speed: 2, turnSpeed: 0.05, flockingDistance: 100, avoidanceDistance: 50 },
    jellyfish: { speed: 0.5, turnSpeed: 0.02, flockingDistance: 150, avoidanceDistance: 100 },
    octopus: { speed: 1, turnSpeed: 0.03, flockingDistance: 200, avoidanceDistance: 150 },
    shark: { speed: 3, turnSpeed: 0.04, flockingDistance: 300, avoidanceDistance: 200 },
    turtle: { speed: 1.5, turnSpeed: 0.02, flockingDistance: 250, avoidanceDistance: 100 }
};

function initializeOcean() {
    addBackgroundElements();
    for (let i = 0; i < 10; i++) addCreature('fish');
    for (let i = 0; i < 5; i++) addCreature('jellyfish');
    for (let i = 0; i < 3; i++) addCreature('octopus');
    addCreature('shark');
    addCreature('turtle');
}

function addBackgroundElements() {
    for (let i = 0; i < 10; i++) {
        const seaweed = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        seaweed.classList.add('seaweed');
        seaweed.style.left = `${Math.random() * 100}%`;
        seaweed.innerHTML = document.getElementById('seaweed-template').outerHTML;
        ocean.appendChild(seaweed);
    }

    for (let i = 0; i < 5; i++) {
        const coral = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        coral.classList.add('coral');
        coral.style.left = `${Math.random() * 100}%`;
        coral.innerHTML = document.getElementById('coral-template').outerHTML;
        ocean.appendChild(coral);
    }
}

function addCreature(type) {
    const creature = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    creature.classList.add('creature', type);
    creature.setAttribute('viewBox', '0 0 200 200');
    creature.innerHTML = creatureTemplates[type].outerHTML;
    
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    creature.style.left = `${x}px`;
    creature.style.top = `${y}px`;
    
    const behavior = { ...creatureBehaviors[type], x, y, angle: Math.random() * Math.PI * 2 };
    creatures.push({ element: creature, type, behavior });
    
    ocean.appendChild(creature);
}

function addFood() {
    const foodCount = 20;
    for (let i = 0; i < foodCount; i++) {
        const food = document.createElement('div');
        food.classList.add('food-particle');
        food.style.left = `${Math.random() * 100}%`;
        food.style.top = `${Math.random() * 100}%`;
        foodParticles.appendChild(food);
        
        setTimeout(() => food.remove(), 10000);
    }
}

function updateCreatures() {
    if (paused) return;
    
    creatures.forEach(creature => {
        const { element, behavior } = creature;
        const { x, y, angle, speed, turnSpeed } = behavior;
        
        // Basic movement
        const newX = x + Math.cos(angle) * speed;
        const newY = y + Math.sin(angle) * speed;
        
        // Boundary checking
        if (newX < 0 || newX > window.innerWidth || newY < 0 || newY > window.innerHeight) {
            behavior.angle += Math.PI;
        } else {
            behavior.x = newX;
            behavior.y = newY;
        }
        
        // Flocking and avoidance
        let flockAngle = 0;
        let avoidAngle = 0;
        let flockCount = 0;
        let avoidCount = 0;
        
        creatures.forEach(other => {
            if (other !== creature) {
                const dx = other.behavior.x - x;
                const dy = other.behavior.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < behavior.flockingDistance) {
                    flockAngle += Math.atan2(dy, dx);
                    flockCount++;
                }
                
                if (distance < behavior.avoidanceDistance) {
                    avoidAngle += Math.atan2(-dy, -dx);
                    avoidCount++;
                }
            }
        });
        
        if (flockCount > 0) behavior.angle += (flockAngle / flockCount - angle) * turnSpeed;
        if (avoidCount > 0) behavior.angle += (avoidAngle / avoidCount - angle) * turnSpeed * 2;
        
        // Apply movement
        element.style.left = `${behavior.x}px`;
        element.style.top = `${behavior.y}px`;
        element.style.transform = `rotate(${behavior.angle}rad)`;
    });
    
    requestAnimationFrame(updateCreatures);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeOcean();
    updateCreatures();
    
    setInterval(() => {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.bottom = '-20px';
        const size = Math.random() * 20 + 5;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.animationDuration = `${Math.random() * 5 + 5}s`;
        ocean.appendChild(bubble);
        setTimeout(() => bubble.remove(), 10000);
    }, 200);

    // Automatically add food every 5 seconds
    setInterval(addFood, 5000);
});

// Add keyboard controls
document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        paused = !paused;
        if (!paused) updateCreatures();
    }
});