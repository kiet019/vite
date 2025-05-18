/**
 * Mobile Viewport Fix
 *
 * This script fixes viewport height issues and input handling on mobile browsers.
 */

export function initMobileViewportFix() {
  // Initial set
  updateViewportHeight();

  // Update on resize and orientation change
  window.addEventListener('resize', updateViewportHeight);
  window.addEventListener('orientationchange', updateViewportHeight);

  // Update when the page is fully loaded
  window.addEventListener('load', updateViewportHeight);

  // Update when the device orientation changes
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', updateViewportHeight);
  }

  // Update when the virtual keyboard appears/disappears
  if ('visualViewport' in window) {
    window.visualViewport.addEventListener('resize', () => {
      updateViewportHeight();
      handleKeyboardVisibility();
    });
    window.visualViewport.addEventListener('scroll', handleKeyboardVisibility);
  }
}

function updateViewportHeight() {
  // Get the actual viewport height
  const vh = ('visualViewport' in window)
    ? window.visualViewport.height * 0.01
    : window.innerHeight * 0.01;

  // Set the --vh custom property
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  // Additional fix for iOS Safari
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    document.documentElement.style.height = `${window.innerHeight}px`;
  }
}

function handleKeyboardVisibility() {
  if ('visualViewport' in window) {
    const viewport = window.visualViewport;
    const isKeyboardVisible = viewport.height < window.innerHeight;

    // Add class to body when keyboard is visible
    document.body.classList.toggle('keyboard-visible', isKeyboardVisible);

    if (isKeyboardVisible) {
      // Ensure the active element is visible
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }
}

// Enhanced Android input fix with better touch handling
export function initAndroidInputFix() {
  // Only apply on Android
  if (/Android/.test(navigator.userAgent)) {
    const inputs = document.querySelectorAll('input[type="text"], textarea');

    inputs.forEach(input => {
      // Handle touch events without preventing default behavior
      input.addEventListener('touchstart', (e) => {
        // Only focus the input without preventing default
        // This allows the keyboard to appear and typing to work
        if (e.touches.length === 1) {
          // Don't prevent default here - that's what's blocking typing
          setTimeout(() => input.focus(), 10);
        }
      });

      // Handle focus
      input.addEventListener('focus', () => {
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Force redraw to ensure visibility
          input.style.transform = 'translateZ(0)';
          input.style.opacity = '0.99';

          setTimeout(() => {
            input.style.opacity = '1';
            input.style.transform = 'none';
          }, 50);
        }, 300);
      });

      // Update viewport on blur
      input.addEventListener('blur', () => {
        setTimeout(updateViewportHeight, 100);
      });
    });

    // Only prevent multi-touch zooming
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1 && !e.target.tagName.match(/INPUT|TEXTAREA/i)) {
        e.preventDefault();
      }
    }, { passive: false });
  }
}

// Enhanced iOS scroll fix
export function initIOSScrollFix() {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    const scrollElements = document.querySelectorAll('.chat-container, .settings-panel');

    scrollElements.forEach(element => {
      element.style.webkitOverflowScrolling = 'touch';

      // Prevent scroll bleed
      element.addEventListener('touchmove', (e) => {
        if (element.scrollHeight <= element.clientHeight) {
          e.preventDefault();
        }
      }, { passive: false });
    });
  }
}
