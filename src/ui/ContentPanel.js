// ContentPanel.js - HTML overlay panel for displaying planet-specific portfolio content
export class ContentPanel {
    constructor(options = {}) {
        this.options = {
            width: 400,
            maxWidth: '80%',
            margin: '20px',
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '10px',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            zIndex: 1000,
            animationDuration: 0.5,
            ...options
        };
        
        this.element = null;
        this.contentElement = null;
        this.closeButton = null;
        this.isVisible = false;
        this.isAnimating = false;
        
        this.createElements();
        this.hide(); // Start hidden
    }
    
    createElements() {
        // Create main container
        this.element = document.createElement('div');
        this.element.style.position = 'fixed';
        this.element.style.top = '0';
        this.element.style.left = '0';
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';
        this.element.style.zIndex = this.options.zIndex.toString();
        this.element.style.pointerEvents = 'none'; // Initially block interactions
        
        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.style.width = `${this.options.width}px`;
        contentContainer.style.maxWidth = this.options.maxWidth;
        contentContainer.style.margin = this.options.margin;
        contentContainer.style.padding = this.options.padding;
        contentContainer.style.backgroundColor = this.options.backgroundColor;
        contentContainer.style.borderRadius = this.options.borderRadius;
        contentContainer.style.boxShadow = this.options.boxShadow;
        contentContainer.style.backdropFilter = this.options.backdropFilter;
        contentContainer.style.border = this.options.border;
        contentContainer.style.color = this.options.color;
        contentContainer.style.fontFamily = this.options.fontFamily;
        contentContainer.style.position = 'relative';
        contentContainer.style.overflowY = 'auto';
        contentContainer.style.maxHeight = '80vh';
        
        // Add close button
        this.closeButton = document.createElement('button');
        this.closeButton.innerHTML = '×';
        this.closeButton.style.position = 'absolute';
        this.closeButton.style.top = '10px';
        this.closeButton.style.right = '10px';
        this.closeButton.style.background = 'transparent';
        this.closeButton.style.border = 'none';
        this.closeButton.style.color = 'white';
        this.closeButton.style.fontSize = '24px';
        this.closeButton.style.cursor = 'pointer';
        this.closeButton.style.width = '30px';
        this.closeButton.style.height = '30px';
        this.closeButton.style.borderRadius = '50%';
        this.closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        this.closeButton.style.transition = 'background-color 0.2s';
        
        this.closeButton.addEventListener('mouseover', () => {
            this.closeButton.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        });
        
        this.closeButton.addEventListener('mouseout', () => {
            this.closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        this.closeButton.addEventListener('click', () => {
            this.hide();
        });
        
        contentContainer.appendChild(this.closeButton);
        
        // Create content area
        this.contentElement = document.createElement('div');
        this.contentElement.style.marginTop = '20px'; // Space for close button
        this.contentElement.style.lineHeight = '1.6';
        contentContainer.appendChild(this.contentElement);
        
        // Add to container
        this.element.appendChild(contentContainer);
        
        // Add to document
        document.body.appendChild(this.element);
    }
    
    show(content, title = '') {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Set content
        this.contentElement.innerHTML = '';
        
        if (title) {
            const titleElement = document.createElement('h2');
            titleElement.textContent = title;
            titleElement.style.marginTop = '0';
            titleElement.style.color = '#4cc9f0';
            titleElement.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
            titleElement.style.paddingBottom = '10px';
            this.contentElement.appendChild(titleElement);
        }
        
        // If content is a string, treat as HTML
        if (typeof content === 'string') {
            this.contentElement.insertAdjacentHTML('beforeend', content);
        } 
        // If content is a DOM element, append it
        else if (content instanceof HTMLElement) {
            this.contentElement.appendChild(content);
        }
        
        // Show with animation
        this.element.style.display = 'flex';
        this.element.style.opacity = '0';
        this.element.style.pointerEvents = 'all'; // Enable interactions
        
        // Trigger reflow for CSS transition
        void this.element.offsetWidth;
        
        // Animate in
        this.element.style.transition = `opacity ${this.options.animationDuration}s ease`;
        this.element.style.opacity = '1';
        
        // Scale animation
        const contentContainer = this.element.firstChild;
        contentContainer.style.transform = 'scale(0.8)';
        contentContainer.style.transition = `transform ${this.options.animationDuration}s ease`;
        
        // Trigger reflow
        void contentContainer.offsetWidth;
        
        contentContainer.style.transform = 'scale(1)';
        
        this.isVisible = true;
        
        // End animation callback
        setTimeout(() => {
            this.isAnimating = false;
        }, this.options.animationDuration * 1000 + 50);
    }
    
    hide() {
        if (!this.isVisible || this.isAnimating) return;
        this.isAnimating = true;
        
        const contentContainer = this.element.firstChild;
        
        // Animate out
        this.element.style.transition = `opacity ${this.options.animationDuration}s ease`;
        this.element.style.opacity = '0';
        
        contentContainer.style.transform = 'scale(0.9)';
        contentContainer.style.transition = `transform ${this.options.animationDuration}s ease`;
        
        // Hide after animation
        setTimeout(() => {
            this.element.style.display = 'none';
            this.element.style.pointerEvents = 'none'; // Disable interactions when hidden
            this.isVisible = false;
            this.isAnimating = false;
            
            // Clear content when hidden
            this.contentElement.innerHTML = '';
        }, this.options.animationDuration * 1000 + 50);
    }
    
    toggle(content, title = '') {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show(content, title);
        }
    }
    
    setPosition(position) {
        // Not needed since we use flexbox centering
        // But could be implemented for specific positioning
    }
    
    setSize(width, height) {
        if (!this.element) return;
        
        const container = this.element.firstChild;
        if (!container) return;
        
        if (width !== undefined) {
            container.style.width = `${width}px`;
        }
        if (height !== undefined) {
            container.style.maxHeight = `${height}px`;
        }
    }
    
    isShown() {
        return this.isVisible;
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.element = null;
        this.contentElement = null;
        this.closeButton = null;
    }
}