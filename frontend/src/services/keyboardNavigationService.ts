// Keyboard Navigation Service for Motor Accessibility
// This service handles keyboard navigation for users with motor disabilities

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: string;
  description: string;
  category: 'navigation' | 'quiz' | 'general' | 'accessibility';
}

export interface FocusableElement {
  element: HTMLElement;
  tabIndex: number;
  category: string;
}

class KeyboardNavigationService {
  private shortcuts: KeyboardShortcut[] = [];
  private focusableElements: FocusableElement[] = [];
  private currentFocusIndex = 0;
  private onActionCallback?: (action: string) => void;
  private isEnabled = false;

  constructor() {
    this.initializeShortcuts();
    this.setupEventListeners();
  }

  private initializeShortcuts() {
    this.shortcuts = [
      // Navigation Shortcuts
      { key: 'h', ctrl: true, action: 'navigate-home', description: 'Go to home page', category: 'navigation' },
      { key: 'q', ctrl: true, action: 'navigate-quiz', description: 'Go to quiz page', category: 'navigation' },
      { key: 'c', ctrl: true, action: 'navigate-clinics', description: 'Go to clinics page', category: 'navigation' },
      { key: 'e', ctrl: true, action: 'navigate-emergency', description: 'Go to emergency page', category: 'navigation' },
      { key: 's', ctrl: true, action: 'navigate-settings', description: 'Go to settings page', category: 'navigation' },
      { key: 'Escape', action: 'go-back', description: 'Go back to previous page', category: 'navigation' },
      
      // Quiz Shortcuts
      { key: '1', action: 'select-option-a', description: 'Select option A', category: 'quiz' },
      { key: '2', action: 'select-option-b', description: 'Select option B', category: 'quiz' },
      { key: '3', action: 'select-option-c', description: 'Select option C', category: 'quiz' },
      { key: '4', action: 'select-option-d', description: 'Select option D', category: 'quiz' },
      { key: 'Enter', action: 'submit-answer', description: 'Submit answer', category: 'quiz' },
      { key: 'ArrowRight', action: 'next-question', description: 'Next question', category: 'quiz' },
      { key: 'ArrowLeft', action: 'previous-question', description: 'Previous question', category: 'quiz' },
      { key: 'n', action: 'next-question', description: 'Next question', category: 'quiz' },
      { key: 'p', action: 'previous-question', description: 'Previous question', category: 'quiz' },
      
      // General Shortcuts
      { key: 'F1', action: 'show-help', description: 'Show help', category: 'general' },
      { key: 'F2', action: 'accessibility-settings', description: 'Open accessibility settings', category: 'general' },
      { key: 'F3', action: 'toggle-voice-commands', description: 'Toggle voice commands', category: 'general' },
      { key: 'F4', action: 'toggle-keyboard-nav', description: 'Toggle keyboard navigation', category: 'general' },
      
      // Accessibility Shortcuts
      { key: '+', ctrl: true, action: 'increase-font-size', description: 'Increase font size', category: 'accessibility' },
      { key: '-', ctrl: true, action: 'decrease-font-size', description: 'Decrease font size', category: 'accessibility' },
      { key: '0', ctrl: true, action: 'reset-font-size', description: 'Reset font size', category: 'accessibility' },
      { key: 'h', ctrl: true, shift: true, action: 'toggle-high-contrast', description: 'Toggle high contrast', category: 'accessibility' },
      { key: 'm', ctrl: true, shift: true, action: 'toggle-reduced-motion', description: 'Toggle reduced motion', category: 'accessibility' },
    ];
  }

  private setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.isEnabled) return;

    // Check for keyboard shortcuts
    const shortcut = this.shortcuts.find(shortcut => {
      return shortcut.key === event.key &&
             !!shortcut.ctrl === event.ctrlKey &&
             !!shortcut.alt === event.altKey &&
             !!shortcut.shift === event.shiftKey;
    });

    if (shortcut) {
      event.preventDefault();
      this.onActionCallback?.(shortcut.action);
      return;
    }

    // Handle Tab navigation
    if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        this.focusPrevious();
      } else {
        this.focusNext();
      }
    }

    // Handle arrow key navigation
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (event.key === 'ArrowUp') {
        this.focusPrevious();
      } else {
        this.focusNext();
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    // Handle any key up events if needed
  }

  private focusNext() {
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusCurrentElement();
  }

  private focusPrevious() {
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = this.currentFocusIndex === 0 
      ? this.focusableElements.length - 1 
      : this.currentFocusIndex - 1;
    this.focusCurrentElement();
  }

  private focusCurrentElement() {
    const currentElement = this.focusableElements[this.currentFocusIndex];
    if (currentElement) {
      currentElement.element.focus();
      currentElement.element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }

  // Enable keyboard navigation
  enable() {
    this.isEnabled = true;
    this.updateFocusableElements();
  }

  // Disable keyboard navigation
  disable() {
    this.isEnabled = false;
  }

  // Update list of focusable elements
  updateFocusableElements() {
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="option"]'
    ];

    const elements = document.querySelectorAll(focusableSelectors.join(', '));
    this.focusableElements = Array.from(elements).map((element, index) => ({
      element: element as HTMLElement,
      tabIndex: index,
      category: this.getElementCategory(element as HTMLElement)
    }));

    // Sort by tab order
    this.focusableElements.sort((a, b) => {
      const aTabIndex = a.element.tabIndex || 0;
      const bTabIndex = b.element.tabIndex || 0;
      return aTabIndex - bTabIndex;
    });
  }

  private getElementCategory(element: HTMLElement): string {
    if (element.tagName === 'BUTTON') return 'button';
    if (element.tagName === 'A') return 'link';
    if (element.tagName === 'INPUT') return 'input';
    if (element.tagName === 'SELECT') return 'select';
    if (element.tagName === 'TEXTAREA') return 'textarea';
    if (element.getAttribute('role') === 'button') return 'button';
    if (element.getAttribute('role') === 'link') return 'link';
    return 'other';
  }

  // Set callback for when an action is triggered
  onAction(callback: (action: string) => void): void {
    this.onActionCallback = callback;
  }

  // Get all available shortcuts
  getShortcuts(): KeyboardShortcut[] {
    return this.shortcuts;
  }

  // Get shortcuts by category
  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return this.shortcuts.filter(shortcut => shortcut.category === category);
  }

  // Check if keyboard navigation is enabled
  getIsEnabled(): boolean {
    return this.isEnabled;
  }

  // Focus on a specific element
  focusElement(element: HTMLElement): void {
    const focusableElement = this.focusableElements.find(fe => fe.element === element);
    if (focusableElement) {
      this.currentFocusIndex = focusableElement.tabIndex;
      this.focusCurrentElement();
    }
  }

  // Focus on first element
  focusFirst(): void {
    if (this.focusableElements.length > 0) {
      this.currentFocusIndex = 0;
      this.focusCurrentElement();
    }
  }

  // Focus on last element
  focusLast(): void {
    if (this.focusableElements.length > 0) {
      this.currentFocusIndex = this.focusableElements.length - 1;
      this.focusCurrentElement();
    }
  }

  // Get current focused element
  getCurrentFocusedElement(): HTMLElement | null {
    return this.focusableElements[this.currentFocusIndex]?.element || null;
  }

  // Add custom shortcut
  addShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.push(shortcut);
  }

  // Remove shortcut
  removeShortcut(key: string, ctrl?: boolean, alt?: boolean, shift?: boolean): void {
    this.shortcuts = this.shortcuts.filter(shortcut => 
      !(shortcut.key === key && 
        !!shortcut.ctrl === !!ctrl && 
        !!shortcut.alt === !!alt && 
        !!shortcut.shift === !!shift)
    );
  }
}

export const keyboardNavigationService = new KeyboardNavigationService();
