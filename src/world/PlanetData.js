// PlanetData.js - Data table for all celestial bodies and their portfolio content
export const PLANET_DATA = {
    sun: {
        name: 'Sol',
        sectionTitle: 'Hero / Introduction',
        contentHTML: `
            <h1>Kamalesh</h1>
            <h2>Full-Stack Developer & Space Enthusiast</h2>
            <p>Welcome to my interactive portfolio - a journey through the solar system where each planet represents a different facet of my professional journey and personal interests.</p>
            <p>Explore the planets to learn about my skills, projects, experience, and more. Each celestial body offers a unique perspective on what I bring to the table as a developer and creative technologist.</p>
            <p><em>Click on any planet to begin your exploration.</em></p>
        `,
        texture: '/textures/sun.jpg',
        radius: 696340, // km (actual)
        color: 0xffd700, // Gold
        mass: 1.989e30, // kg
        orbitRadius: 0, // Sun is at center
        orbitSpeed: 0, // Sun is stationary
        axialTilt: 7.25 * Math.PI / 180, // degrees to radians
        rotationPeriod: 25.05 * 24 * 3600, // seconds (sidereal day)
        hasRings: false,
        portfolioSection: 'hero'
    },
    mercury: {
        name: 'Mercury',
        sectionTitle: 'Quick Facts / TL;DR',
        contentHTML: `
            <h2>Quick Facts</h2>
            <p>I'm Kamalesh, a full-stack developer passionate about creating immersive web experiences and pushing the boundaries of what's possible with web technologies.</p>
            <ul>
                <li><strong>Location:</strong> San Francisco, CA</li>
                <li><strong>Experience:</strong> 5+ years in web development</li>
                <li><strong>Specialties:</strong> Three.js, WebGL, React, Node.js, WebXR</li>
                <li><strong>Passion:</strong> Space exploration, physics simulations, and interactive storytelling</li>
            </ul>
            <p>This solar system portfolio represents my passion for combining technical excellence with creative vision.</p>
        `,
        texture: '/textures/mercury.jpg',
        radius: 2439.7, // km
        color: 0x8a8a8a, // Gray-brown
        mass: 3.3011e23, // kg
        orbitRadius: 0.387, // AU
        orbitSpeed: 47400, // m/s (orbital velocity)
        axialTilt: 0.03 * Math.PI / 180, // degrees to radians
        rotationPeriod: 58.6 * 24 * 3600, // seconds (sidereal day)
        hasRings: false,
        portfolioSection: 'about-tl-dr'
    },
    venus: {
        name: 'Venus',
        sectionTitle: 'About Me',
        contentHTML: `
            <h2>About Me</h2>
            <p>I'm a full-stack developer with a passion for creating immersive, interactive experiences that push the boundaries of web technology. My journey began with a fascination for how things work, which led me to explore everything from low-level graphics programming to high-level application architecture.</p>
            <p>When I'm not coding, you can find me stargazing, reading about astrophysics, or experimenting with new ways to visualize complex data. I believe that the best technology should feel intuitive and magical - like discovering a new constellation in the night sky.</p>
            <h3>Technical Background</h3>
            <ul>
                <li>Bachelor's degree in Computer Science</li>
                <li>5+ years professional experience in web development</li>
                <li>Expertise in JavaScript/TypeScript, React, Node.js, and WebGL</li>
                <li>Strong background in 3D graphics, physics simulations, and real-time rendering</li>
            </ul>
            <h3>Philosophy</h3>
            <p>I believe technology should serve humanity by making complex things simple, enabling creativity, and connecting people in meaningful ways. The best interfaces feel like natural extensions of our capabilities.</p>
        `,
        texture: '/textures/venus.jpg',
        radius: 6051.8, // km
        color: 0xffd700, // Golden
        mass: 4.8675e24, // kg
        orbitRadius: 0.723, // AU
        orbitSpeed: 35000, // m/s
        axialTilt: 177.4 * Math.PI / 180, // degrees to radians (retrograde rotation)
        rotationPeriod: 243 * 24 * 3600, // seconds (sidereal day)
        hasRings: false,
        portfolioSection: 'about'
    },
    earth: {
        name: 'Earth',
        sectionTitle: 'Skills',
        contentHTML: `
            <h2>Technical Skills</h2>
            <div class="skills-grid">
                <div class="skill-category">
                    <h3>Languages</h3>
                    <ul>
                        <li>JavaScript/ES6+</li>
                        <li>TypeScript</li>
                        <li>Python</li>
                        <li>GLSL</li>
                        <li>HTML5/CSS3</li>
                    </ul>
                </div>
                
                <div class="skill-category">
                    <h3>Frontend</h3>
                    <ul>
                        <li>React (Hooks, Context, Suspense)</li>
                        <li>Vue.js 3</li>
                        <li>Svelte</li>
                        <li>Three.js/WebGL</li>
                        <li>WebXR/WebVR</li>
                        <li>GSAP/Framer Motion</li>
                        <li>D3.js</li>
                    </ul>
                </div>
                
                <div class="skill-category">
                    <h3>Backend</h3>
                    <ul>
                        <li>Node.js/Express</li>
                        <li>Python/Django</li>
                        <li>RESTful APIs</li>
                        <li>GraphQL</li>
                        <li>WebSockets/Socket.io</li>
                        <li>AWS/Azure/GCP</li>
                    </ul>
                </div>
                
                <div class="skill-category">
                    <h3>Graphics & Simulation</h3>
                    <ul>
                        <li>Three.js/WebGL</li>
                        <li>WebGPU</li>
                        <li>Shader Development (GLSL)</li>
                        <li>Physics Engines (Cannon.js, Rapier, Ammo.js)</li>
                        <li>Procedural Generation</li>
                        <li>Ray Tracing/Path Tracing</li>
                    </ul>
                </div>
                
                <div class="skill-category">
                    <h3>Tools & Practices</h3>
                    <ul>
                        <li>Git/GitHub</li>
                        <li>Docker/Kubernetes</li>
                        <li>CI/CD Pipelines</li>
                        <li>Test-Driven Development (TDD)</li>
                        <li>Agile/Scrum Methodologies</li>
                        <li>Performance Optimization</li>
                        <li>Web Accessibility (WCAG)</li>
                    </ul>
                </div>
            </div>
            
            <div class="skill-levels">
                <h3>Proficiency Levels</h3>
                <div class="skill-bar">
                    <span>Three.js/WebGL</span>
                    <div class="bar-fill" style="width: 90%;"></div>
                </div>
                <div class="skill-bar">
                    <span>React</span>
                    <div class="bar-fill" style="width: 85%;"></div>
                </div>
                <div class="skill-bar">
                    <span>Node.js</span>
                    <div class="bar-fill" style="width: 80%;"></div>
                </div>
                <div class="skill-bar">
                    <span>TypeScript</span>
                    <div class="bar-fill" style="width: 75%;"></div>
                </div>
                <div class="skill-bar">
                    <span>WebGL Shading</span>
                    <div class="bar-fill" style="width: 70%;"></div>
                </div>
            </div>
        `,
        texture: '/textures/earth_daymap.jpg',
        cloudTexture: '/textures/earth_clouds.jpg',
        radius: 6371.0, // km
        color: 0x2233ff, // Blue
        mass: 5.972e24, // kg
        orbitRadius: 1.0, // AU
        orbitSpeed: 29800, // m/s
        axialTilt: 23.44 * Math.PI / 180, // degrees to radians
        rotationPeriod: 23.934 * 3600, // seconds (sidereal day)
        hasRings: false,
        portfolioSection: 'skills'
    },
    mars: {
        name: 'Mars',
        sectionTitle: 'Projects',
        contentHTML: `
            <h2>Featured Projects</h2>
            <div class="projects-grid">
                <div class="project-card">
                    <h3>Neural Mesh Visualizer</h3>
                    <p>An interactive WebGL application for visualizing and manipulating neural network architectures in 3D space. Users can create, modify, and train neural networks while seeing the mathematical representations in real-time.</p>
                    <div class="tech-tags">
                        <span>Three.js</span>
                        <span>WebGL</span>
                        <li>TensorFlow.js</li>
                        <li>React</li>
                        <li>GLSL</li>
                    </div>
                    <a href="https://github.com/yourusername/neural-mesh-visualizer" target="_blank" class="project-link">View on GitHub</a>
                </div>
                
                <div class="project-card">
                    <h3>Orbital Mechanics Simulator</h3>
                    <p>A scientifically accurate simulation of orbital mechanics featuring realistic n-body physics, orbital transfers, and celestial body interactions. Built to demonstrate Kepler's laws and Newtonian gravitation.</p>
                    <div class="tech-tags">
                        <span>Physics Simulation</span>
                        <span>Numerical Methods</span>
                        <li>Three.js</span>
                        <li>React</li>
                        <li>Stats.js</li>
                    </div>
                    <a href="https://github.com/yourusername/orbital-simulator" target="_blank" class="project-link">View on GitHub</a>
                </div>
                
                <div class="project-card">
                    <h3>VR Data Dashboard</h3>
                    <p>A virtual reality interface for exploring complex datasets in immersive 3D environments. Users can manipulate data points, create visualizations, and collaborate with others in shared virtual spaces.</p>
                    <div class="tech-tags">
                        <span>WebXR</span>
                        <span>Three.js</span>
                        <li>React</li>
                        <li>WebGL</li>
                        <li>Node.js</li>
                    </div>
                    <a href="https://github.com/yourusername/vr-data-dashboard" target="_blank" class="project-link">View on GitHub</a>
                </div>
                
                <div class="project-card">
                    <h3>Procedural Universe Generator</h3>
                    <p>Generate infinite star systems with procedurally created planets, each with unique characteristics, atmospheres, and potential for life. Based on real astrophysical principles and procedural generation techniques.</p>
                    <div class="tech-tags">
                        <span>Procedural Generation</span>
                        <span>Noise Functions</span>
                        <li>Three.js</span>
                        <li>WebGL</li>
                        <li>Simplex Noise</li>
                        <li>Web Workers</li>
                    </div>
                    <a href="https://github.com/yourusername/procedural-universe" target="_blank" class="project-link">View on GitHub</a>
                </div>
            </div>
            
            <div class="project-footer">
                <p>Explore more projects on my <a href="https://github.com/yourusername" target="_blank">GitHub profile</a>.</p>
            </div>
        `,
        texture: '/textures/mars.jpg',
        radius: 3389.5, // km
        color: 0xc1440e, // Red-orange
        mass: 6.4171e23, // kg
        orbitRadius: 1.524, // AU
        orbitSpeed: 24100, // m/s
        axialTilt: 25.19 * Math.PI / 180, // degrees to radians
        rotationPeriod: 24.623 * 3600, // seconds (sidereal day)
        hasRings: false,
        portfolioSection: 'projects'
    },
    jupiter: {
        name: 'Jupiter',
        sectionTitle: 'Experience / Work History',
        contentHTML: `
            <h2>Professional Experience</h2>
            <div class="timeline">
                <div class="job">
                    <h3>Senior WebGL Engineer</h3>
                    <p class="company>Nebula Technologies</company>
                    <p class="date">Jan 2022 - Present</p>
                    <p>Lead developer for immersive web experiences using Three.js and WebGL. Responsible for:</p>
                    <ul>
                        <li>Designing and implementing real-time 3D visualization engines</li>
                        <li>Optimizing rendering performance for complex scenes</li>
                        <li>Mentoring junior developers in 3D graphics programming</li>
                        <li>Collaborating with UX/UI designers to create intuitive 3D interfaces</li>
                    </ul>
                    <div class="tech-tags">
                        <span>Three.js</span>
                        <span>WebGL2</span>
                        <li>TypeScript</li>
                        <li>GLSL</li>
                        <li>WebSocket</li>
                    </div>
                </div>
                
                <div class="job">
                    <h3>Full Stack Developer</h3>
                    <p class="company">Stellar Interactive</p>
                    <p class="date">Mar 2020 - Dec 2021</p>
                    <p>Developed full-stack web applications with focus on interactive data visualization:</p>
                    <ul>
                        <li>Built React applications with Node.js/Express backends</li>
                        <li>Created custom data visualization libraries using D3.js and Canvas</li>
                        <li>Implemented real-time collaboration features using WebSockets</li>
                        <li>Optimized application performance and reduced load times by 40%</li>
                    </ul>
                    <div class="tech-tags">
                        <span>React</span>
                        <span>Node.js</span>
                        <li>Express</li>
                        <li>MongoDB</li>
                        <li>WebSockets</li>
                    </div>
                </div>
                
                <div class="job">
                    <h3>Junior Developer</h3>
                    <p class="company">Cosmic Web Solutions</p>
                    <p class="date">Jun 2018 - Feb 2020</p>
                    <p>Entry-level position focusing on web development fundamentals:</p>
                    <ul>
                        <li>Developed responsive websites using HTML5, CSS3, and JavaScript</li>
                        <li>Assisted in maintaining and updating client websites</li>
                        <li>Learned version control with Git and collaborative development practices</li>
                        <li>Participated in code reviews and agile development processes</li>
                    </ul>
                    <div class="tech-tags">
                        <span>HTML5</span>
                        <span>CSS3</span>
                        <li>JavaScript</li>
                        <li>Git</li>
                        <li>jQuery</li>
                    </div>
                </div>
            </div>
            
            <div class="experience-summary">
                <h3>Summary</h3>
                <p>Over 5 years of progressive experience in web development, specializing in interactive 3D graphics and immersive web experiences. Proven track record of delivering high-performance applications that push the boundaries of what's possible in the browser.</p>
            </div>
        `,
        texture: '/textures/jupiter.jpg',
        radius: 69911, // km
        color: 0xd8ca9d, // Pale orange-tan
        mass: 1.898e27, // kg
        orbitRadius: 5.203, // AU
        orbitSpeed: 13100, // m/s
        axialTilt: 3.13 * Math.PI / 180, // degrees to radians
        rotationPeriod: 9.925 * 3600, // seconds (fastest rotation in solar system)
        hasRings: false,
        portfolioSection: 'experience'
    },
    saturn: {
        name: 'Saturn',
        sectionTitle: 'Education / Certifications',
        contentHTML: `
            <h2>Education & Certifications</h2>
            <div class="education-section">
                <h3>Formal Education</h3>
                <div class="education-item">
                    <h4>Bachelor of Science in Computer Science</h4>
                    <p class="institution">Stanford University</p>
                    <p class="date">2014 - 2018</p>
                    <p>Focus: Computer Graphics, Scientific Computing, and Software Engineering</p>
                    <ul>
                        <li>GPA: 3.8/4.0</li>
                        <li>Relevant Coursework: Computer Graphics, Physics Simulations, Algorithms, Linear Algebra</li>
                        <li>Senior Thesis: "Real-Time Ray Tracing in WebGL for Interactive Scientific Visualization"</li>
                    </ul>
                </div>
                
                <div class="education-item">
                    <h4>Summer Research Program</h4>
                    <p class="institution">NASA Jet Propulsion Laboratory</p>
                    <p class="date">Summer 2017</p>
                    <p>Research internship focused on:</p>
                    <ul>
                        <li>3D visualization of planetary science data</li>
                        <li>Web-based mission planning tools</li>
                        <li>Interactive educational applications for space exploration</li>
                    </ul>
                </div>
            </div>
            
            <div class="certifications-section">
                <h3>Certifications & Professional Development</h3>
                <div class="certification-item">
                    <h4>Google Cloud Professional Cloud Developer</h4>
                    <p class="date">2021</p>
                    <p>Validated expertise in designing, developing, and managing robust, scalable, highly available, and fault-tolerant applications on Google Cloud Platform.</p>
                </div>
                
                <div class="certification-item">
                    <h4>Three.js Advanced Certification</h4>
                    <p class="date">2020</p>
                    <p>Specialized training in advanced Three.js techniques including shader development, post-processing, and performance optimization.</p>
                </div>
                
                <div class="certification-item">
                    <h4>Unity Certified Developer</h4>
                    <p class="date">2019</p>
                    <p>Demonstrated proficiency in Unity game engine and C# programming for interactive 3D applications.</p>
                </div>
                
                <div class="certification-item">
                    <h4>AWS Certified Developer Associate</h4>
                    <p class="date">2018</p>
                    <p>Validated ability to develop and maintain applications on Amazon Web Services platform.</p>
                </div>
            </div>
            
            <div class="education-footer">
                <p>Continuous learning is essential in the fast-evolving field of web technologies. I regularly participate in workshops, conferences, and online courses to stay current with emerging trends and technologies.</p>
            </div>
        `,
        texture: '/textures/saturn.jpg',
        ringTexture: '/textures/saturn_ring.png',
        radius: 58232, // km
        color: 0xf4b183, // Pale gold
        mass: 5.6834e26, // kg
        orbitRadius: 9.537, // AU
        orbitSpeed: 9700, // m/s
        axialTilt: 26.73 * Math.PI / 180, // degrees to radians
        rotationPeriod: 10.656 * 3600, // seconds
        hasRings: false,
        portfolioSection: 'education'
    },
    uranus: {
        name: 'Uranus',
        sectionTitle: 'Achievements / Awards',
        contentHTML: `
            <h2>Achievements & Awards</h2>
            <div class="achievements-grid">
                <div class="achievement-item">
                    <h3>Webby Award Nominee</h3>
                    <p class="year">2023</p>
                    <p>Nominee for Best Visual Design - Function for the "Nebula Navigator" interactive space exploration experience.</p>
                </div>
                
                <div class="achievement-item">
                    <h3>Chrome Experiment Feature</h3>
                    <p class="year">2022</p>
                    <p>Featured experiment on Chrome Experiments for the "Quantum Leap" interactive quantum mechanics visualization.</p>
                </div>
                
                <div class="achievement-item">
                    <h3>GitHub Starred Project</h3>
                    <p class="year">2021</p>
                    <p>Orbital Mechanics Simulator reached 1.5k+ stars on GitHub and was featured in several tech newsletters.</p>
                </div>
                
                <div class="achievement-item">
                    <h3>Hackathon Winner</h3>
                    <p class="year">2020</p>
                    <p>First place at SpaceApps Hackathon for "Mars Colony Planner" - a collaborative VR environment for designing Mars settlements.</p>
                </div>
                
                <div class="achievement-item">
                    <h3>Conference Speaker</h3>
                    <p class="year">2021-2023</p>
                    <p>Invited speaker at WebGL Camp, SIGGRAPH, and various tech conferences on topics including:</p>
                    <ul>
                        <li>Real-time ray tracing in WebGL</li>
                        <li>Physics-based rendering for the web</li>
                        <li>Interactive data visualization in 3D spaces</li>
                    </ul>
                </div>
            </div>
            
            <div class="achievements-summary">
                <h3>Publications & Talks</h3>
                <p>I've contributed to several technical publications and given talks on web graphics and immersive technologies:</p>
                <ul>
                    <li>"Real-Time Global Illumination in WebGL" - WebGL Summit 2022</li>
                    <li>"Physics-Based Rendering for Web Applications" - SIGGRAPH Asia 2021</li>
                    <li>"Building Immersive Web Experiences with Three.js" - Mozilla Tech Talk 2020</li>
                    <li>"WebXR and the Future of Spatial Computing" - HTML5 Developer Conference 2019</li>
                </ul>
            </div>
        `,
        texture: '/textures/uranus.jpg',
        radius: 25362, // km
        color: 0x7db8b8, // Pale cyan
        mass: 8.6810e25, // kg
        orbitRadius: 19.191, // AU
        orbitSpeed: 6800, // m/s
        axialTilt: 97.77 * Math.PI / 180, // degrees to radians (extreme tilt)
        rotationPeriod: 17.24 * 3600, // seconds
        hasRings: false,
        portfolioSection: 'achievements'
    },
    neptune: {
        name: 'Neptune',
        sectionTitle: 'Contact',
        contentHTML: `
            <h2>Get In Touch</h2>
            <p>I'm always excited to discuss new projects, collaborations, or just talk about space and technology. Feel free to reach out through any of the following channels:</p>
            
            <div class="contact-info">
                <div class="contact-item">
                    <h3>Email</h3>
                    <p><a href="mailto:alex.rivera@email.com">alex.rivera@email.com</a></p>
                </div>
                
                <div class="contact-item">
                    <h3>Professional Networks</h3>
                    <ul>
                        <li><a href="https://linkedin.com/in/alexrivera" target="_blank">LinkedIn</a></li>
                        <li><a href="https://github.com/alexrivera" target="_blank">GitHub</a></li>
                        <li><a href="https://twitter.com/alexr_dev" target="_blank">Twitter/X</a></li>
                        <li><a href="https://dev.to/alexrivera" target="_blank">Dev.to</a></li>
                    </ul>
                </div>
                
                <div class="contact-item">
                    <h3>Current Location</h3>
                    <p>San Francisco Bay Area, California</p>
                    <p>Open to remote opportunities worldwide</p>
                </div>
            </div>
            
            <div class="contact-form">
                <h3>Send Me a Message</h3>
                <form id="contactForm">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="subject">Subject</label>
                        <input type="text" id="subject" name="subject" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>
                    
                    <button type="submit" class="btn-primary">Send Message</button>
                </form>
                
                <div id="formStatus" class="form-status"></div>
            </div>
            
            <div class="contact-footer">
                <p>I typically respond within 24-48 hours. Looking forward to hearing from you!</p>
            </div>
        `,
        texture: '/textures/neptune.jpg',
        radius: 24622, // km
        color: 0x4b6dff, // Deep blue
        mass: 1.02413e26, // kg
        orbitRadius: 30.069, // AU
        orbitSpeed: 5400, // m/s
        axialTilt: 28.32 * Math.PI / 180, // degrees to radians
        rotationPeriod: 16.11 * 3600, // seconds
        hasRings: false,
        portfolioSection: 'contact'
    }
};

// Helper function to get section content for a planet
export function getPlanetSection(planetKey) {
    return PLANET_DATA[planetKey] || null;
}

// Helper function to get all planet keys
export function getPlanetKeys() {
    return Object.keys(PLANET_DATA).filter(key => key !== 'sun'); // Exclude sun if needed
}