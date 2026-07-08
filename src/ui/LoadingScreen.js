// LoadingScreen.js - Handles asset loading progress display
export class LoadingScreen {
    constructor(options = {}) {
        this.options = {
            text: 'Loading Solar System Explorer...',
            textColor: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            ...options
        };
        
        this.element = null;
        this.progressBar = null;
        this.progressText = null;
        this.errorText = null;
        this.isVisible = false;
        
        this.createElements();
        
        // NOTE: No hardcoded setTimeout auto-hide — that masks real errors.
        // The loading screen will be hidden only when:
        //   1. loader.onLoad fires (all assets loaded), or
        //   2. init.js explicitly calls hide() after await Promise.allSettled
    }
    
    createElements() {
        // Create container
        this.element = document.createElement('div');
        this.element.style.position = 'fixed';
        this.element.style.top = '0';
        this.element.style.left = '0';
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.element.style.backgroundColor = this.options.backgroundColor;
        this.element.style.color = this.options.textColor;
        this.element.style.display = 'flex';
        this.element.style.flexDirection = 'column';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';
        this.element.style.zIndex = '1000';
        this.element.style.fontFamily = 'Arial, sans-serif';
        this.element.style.transition = 'opacity 0.6s ease';
        
        // Create text
        const title = document.createElement('h1');
        title.textContent = this.options.text;
        title.style.margin = '0 0 20px 0';
        title.style.fontSize = '2rem';
        this.element.appendChild(title);
        
        // Create progress container
        const progressContainer = document.createElement('div');
        progressContainer.style.width = '80%';
        progressContainer.style.maxWidth = '400px';
        progressContainer.style.height = '20px';
        progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        progressContainer.style.borderRadius = '10px';
        progressContainer.style.overflow = 'hidden';
        this.element.appendChild(progressContainer);
        
        // Create progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.style.width = '0%';
        this.progressBar.style.height = '100%';
        this.progressBar.style.background = 'linear-gradient(90deg, #4cc9f0, #f72585)';
        this.progressBar.style.transition = 'width 0.3s ease';
        progressContainer.appendChild(this.progressBar);
        
        // Create progress text
        this.progressText = document.createElement('div');
        this.progressText.style.marginTop = '10px';
        this.progressText.style.fontSize = '1.1rem';
        this.progressText.textContent = '0%';
        this.element.appendChild(this.progressText);
        
        // Create error text container
        this.errorText = document.createElement('div');
        this.errorText.style.marginTop = '20px';
        this.errorText.style.color = '#ff5555';
        this.errorText.style.fontSize = '1.2rem';
        this.errorText.style.fontWeight = 'bold';
        this.errorText.style.display = 'none';
        this.errorText.style.textAlign = 'center';
        this.errorText.style.maxWidth = '80%';
        this.element.appendChild(this.errorText);
        
        // Add to document
        document.body.appendChild(this.element);
        
        // Start hidden
        this.hide();
    }
    
    show() {
        if (!this.element) return;
        this.element.style.opacity = '1';
        this.element.style.display = 'flex';
        this.element.style.pointerEvents = 'auto';
        this.isVisible = true;
    }
    
    hide() {
        if (!this.element) return;
        // Fade out, then display:none after transition
        this.element.style.opacity = '0';
        this.element.style.pointerEvents = 'none';
        this.isVisible = false;
        
        // Also hide the static HTML loading screen from index.html
        const htmlLoadingScreen = document.getElementById('loading-screen');
        if (htmlLoadingScreen) {
            htmlLoadingScreen.style.opacity = '0';
            htmlLoadingScreen.style.pointerEvents = 'none';
            setTimeout(() => {
                htmlLoadingScreen.style.display = 'none';
            }, 600);
        }
        
        setTimeout(() => {
            if (this.element) this.element.style.display = 'none';
        }, 600);
    }
    
    setProgress(percentage) {
        if (!this.progressBar || !this.progressText) return;
        
        // Clamp percentage between 0 and 100
        const clampedPercent = Math.max(0, Math.min(100, percentage));
        
        // Update progress bar width
        this.progressBar.style.width = `${clampedPercent}%`;
        
        // Update text
        this.progressText.textContent = `${Math.round(clampedPercent)}%`;
        
        // Also update the static HTML loading screen progress bar (index.html)
        const htmlProgressBar = document.getElementById('progress-bar');
        const htmlProgressText = document.getElementById('progress-text');
        if (htmlProgressBar) htmlProgressBar.style.width = `${clampedPercent}%`;
        if (htmlProgressText) htmlProgressText.textContent = `${Math.round(clampedPercent)}%`;
    }
    
    setText(text) {
        if (!this.element) return;
        
        // Update the heading text
        const heading = this.element.querySelector('h1');
        if (heading) {
            heading.textContent = text;
        }
    }
    
    showError(message) {
        if (!this.errorText) return;
        this.errorText.textContent = message;
        this.errorText.style.display = 'block';
        if (this.progressBar) {
            this.progressBar.style.background = '#ff5555';
        }
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.progressBar = null;
        this.progressText = null;
    }
}