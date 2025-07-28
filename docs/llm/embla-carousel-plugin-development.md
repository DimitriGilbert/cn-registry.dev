# Embla Carousel Plugin Development Guide

## Understanding Embla's Loop Mechanism

### How Embla Creates Infinite Loops

**No DOM Cloning**: Unlike many carousel libraries, Embla doesn't clone DOM elements to create the loop effect. Instead, it uses CSS transforms to reposition existing slides dynamically.

**Transform-Based Positioning**: When `loop: true` is enabled, Embla applies `translateX` or `translateY` to slides that need to change position to create the seamless loop effect. This approach is more performant and memory-efficient than DOM cloning.

**Automatic Fallback**: Embla automatically falls back to `loop: false` if there aren't enough slides to create the loop effect without visible glitches.

**Internal Components**:
- `engine.slideLooper.loopPoints` - manages loop positioning logic
- `engine.slideLooper.loop()` - initializes the loop functionality  
- `engine.slideLooper.clear()` - cleans up loop positioning
- `engine.translate` - manages slide transforms for positioning

### How slideNodes() and slideRegistry Work in Loop Mode

**slideNodes()**: Returns an array of all slide HTML elements in their original DOM order. In loop mode, these are the same physical DOM elements that get repositioned using transforms - no clones are created.

**slideRegistry**: An internal array that maps slide DOM elements to their logical slide positions. In loop mode:
- `slideRegistry[logicalIndex]` contains arrays of DOM element indices
- Multiple DOM elements can map to the same logical slide when repositioned for looping
- Use `emblaApi.internalEngine().slideRegistry` to access (advanced usage only)

**Key Insight**: Your plugin should work with `slideNodes()` for DOM manipulation but be aware that in loop mode, the same logical slide might be represented by different DOM positions due to transform repositioning.

## Core Principles for Loop-Safe Plugin Development

### 1. Respect Embla's Transform System
- Embla uses `translateX/translateY` to position slides for infinite loops
- The carousel automatically creates loop points to provide seamless infinite scrolling
- Loop mechanics depend on slide positioning calculations that should NOT be interfered with

### 2. Plugin Structure Requirements
```typescript
export function CustomPlugin(userOptions: Options = {}) {
  const options = { ...defaultOptions, ...userOptions };
  let emblaApi: EmblaCarouselType;
  let slides: HTMLElement[] = [];

  function init(emblaApiInstance: EmblaCarouselType): void {
    emblaApi = emblaApiInstance;
    slides = emblaApi.slideNodes();
    // Setup event listeners
  }

  function destroy(): void {
    // Cleanup event listeners
    // Reset all slide styles
  }

  return {
    name: "customPlugin",
    options,
    init,
    destroy
  };
}
```

### 3. CRITICAL RULES for Loop Compatibility

#### ❌ NEVER DO:
- Manipulate slide `translateX/translateY` directly
- Change slide positioning or layout that affects carousel calculations  
- Hide slides with `display: none` or `visibility: hidden`
- Use `scroll` events for effects that change slide dimensions/positioning
- Apply transforms that change slide width/height during transitions

#### ✅ ALWAYS DO:
- Use `select` events for stable state changes
- Apply visual effects that don't affect positioning (scale, rotate, opacity)
- Reset all custom styles in destroy() method
- Use `slidesInView()` to determine which slides are currently visible
- Respect the carousel's layout and positioning system

### 4. Safe Animation Approaches

#### For Scale/Transform Effects:
```typescript
function applyEffects(): void {
  const slidesInView = emblaApi.slidesInView();
  
  slides.forEach((slide, index) => {
    if (slidesInView.includes(index)) {
      // Apply safe transforms that don't affect positioning
      slide.style.transform = `scale(${scale})`;
      // ✅ Safe: scale, rotateZ, opacity
      // ❌ Dangerous: translateX, translateY, width, height
    }
  });
}
```

#### For Position-Based Effects:
```typescript
function applyPositionEffects(): void {
  const scrollProgress = emblaApi.scrollProgress();
  const snapList = emblaApi.scrollSnapList();
  
  slides.forEach((slide, index) => {
    const slideProgress = snapList[index];
    const distance = slideProgress - scrollProgress;
    
    // Use distance for visual effects only, not positioning
    const rotation = distance * intensity;
    slide.style.transform = `perspective(1000px) rotateY(${rotation}deg)`;
  });
}
```

### 5. Event Handling Best Practices

**Safe Events for Loop Mode**:
- `select`: Fires when scroll snap changes - SAFEST for stable effects
- `settle`: Fires after scrolling completes - safe for post-transition effects
- `reInit`: Fires when carousel reinitializes - good for setup/cleanup
- `init`: Fires once on carousel mount - safe for initial setup

**Events to Use Carefully**:
- `scroll`: Fires continuously during scrolling - use only for safe visual effects that don't affect positioning
- `slidesInView`: Fires when slides enter/exit viewport - use for visibility-based effects only

**Events During Loop Transitions**: During loop transitions, Embla repositions slides using transforms. The `scroll` event fires continuously during this process. Plugins should avoid making layout changes during `scroll` events that could interfere with the positioning system.

```typescript
function init(emblaApiInstance: EmblaCarouselType): void {
  emblaApi = emblaApiInstance;
  slides = emblaApi.slideNodes();
  
  // ✅ Use 'select' for stable effects
  emblaApi.on('select', applyStableEffects);
  
  // ✅ Use 'scroll' only for safe visual effects
  emblaApi.on('scroll', applySafeVisualEffects);
  
  // ✅ Use 'settle' for post-transition cleanup
  emblaApi.on('settle', applyPostTransitionEffects);
  
  // Apply initial state
  applyStableEffects();
}
```

### 6. Debugging Loop Issues

If your plugin breaks the loop:
1. Check if you're modifying slide positioning
2. Ensure no transforms affect slide dimensions
3. Verify you're not hiding slides during transitions
4. Test with `loop: false` - if it works, the issue is loop interference
5. Use browser dev tools to inspect slide transforms during loop transitions

### 7. How Official Embla Plugins Handle Loop Mode

**Autoplay Plugin Pattern**: The official Autoplay plugin is loop-safe because it:
- Only triggers navigation methods (`scrollNext()`, `scrollPrev()`)
- Never manipulates slide DOM elements directly
- Uses timers for scheduling, not DOM manipulation
- Lets Embla handle all positioning and transforms

**Key Pattern**: Official plugins work at the API level (triggering scrolls) rather than the DOM level (manipulating elements).

### 8. Working Examples

#### ShrinkGrow Plugin (Loop-Safe Version):
```typescript
function applyShrinkGrowStyles(): void {
  const slidesInView = emblaApi.slidesInView();
  const visibleCount = slidesInView.length;
  
  if (visibleCount === 0) return;
  
  // Find center slide from visible slides
  const centerIndex = slidesInView[Math.floor(visibleCount / 2)];
  
  // Apply scale to all DOM elements
  slides.forEach((slide, slideElementIndex) => {
    // Check if this DOM element represents the center slide
    const isCenter = slidesInView.includes(slideElementIndex) && 
                     slideElementIndex === centerIndex;
    
    const scale = isCenter ? options.growScale : options.shrinkScale;
    
    // Safe: only affects visual scale, not positioning
    slide.style.transform = `scale(${scale})`;
  });
}
```

#### Flip Plugin (Loop-Safe):
```typescript
function applyFlipStyles(): void {
  const scrollProgress = emblaApi.scrollProgress();
  const snapList = emblaApi.scrollSnapList();

  slides.forEach((slide, index) => {
    const slideProgress = snapList[index];
    const distance = slideProgress - scrollProgress;
    const rotateY = distance * 45;
    
    // Safe: 3D transforms don't affect carousel positioning
    slide.style.transform = `perspective(1000px) rotateY(${rotateY}deg)`;
    slide.style.transformStyle = "preserve-3d";
  });
}
```

#### Opacity Fade Plugin (Loop-Safe):
```typescript
function applyOpacityStyles(): void {
  const slidesInView = emblaApi.slidesInView();
  
  slides.forEach((slide, index) => {
    const isVisible = slidesInView.includes(index);
    
    // Safe: opacity doesn't affect positioning
    slide.style.opacity = isVisible ? "1" : "0.3";
    slide.style.transition = "opacity 300ms ease-out";
  });
}
```

## Analysis of Your ShrinkGrow Plugin Issues

### Problem: Empty Slots and Loop "Popping"

Your current ShrinkGrow plugin breaks in loop mode because:

1. **Incorrect slideRegistry Usage**: You're using `emblaApi.internalEngine().slideRegistry.findIndex()` to map DOM elements to logical slides, but this approach doesn't account for how Embla repositions slides during loop transitions.

2. **Event Timing Issues**: Your plugin applies scaling on every `scroll` event, which interferes with Embla's transform calculations during loop transitions.

3. **Center Calculation Problem**: Your center slide calculation assumes a fixed relationship between DOM element index and logical slide position, which breaks when slides are repositioned for looping.

### The Fix: Simplified Loop-Safe Approach

```typescript
function applyScales(): void {
  const slidesInView = emblaApi.slidesInView();
  const visibleCount = slidesInView.length;
  
  if (visibleCount === 0) return;
  
  // Find center slide from VISIBLE slides only
  const centerIndex = slidesInView[Math.floor(visibleCount / 2)];
  
  // Apply scale based on slidesInView, not slideRegistry
  slides.forEach((slide, slideElementIndex) => {
    const isCenter = slideElementIndex === centerIndex;
    const scale = isCenter ? options.growScale : options.shrinkScale;
    slide.style.transform = `scale(${scale})`;
  });
}
```

**Key Changes**:
- Removed complex `slideRegistry` logic
- Use `slidesInView()` to determine which slides to scale
- Simplified center calculation based on visible slides only
- This works in both loop and non-loop modes

## Common Pitfalls and Solutions

### Problem: Empty slots during loop
**Cause**: Plugin hiding or repositioning slides during loop transitions
**Solution**: Only apply visual effects, never hide slides

### Problem: Jerky transitions  
**Cause**: Applying effects on scroll that change layout
**Solution**: Use scroll events only for safe visual effects

### Problem: Loop breaks completely
**Cause**: Interfering with Embla's internal positioning system
**Solution**: Stick to visual transforms only (scale, rotate, opacity)

### Problem: Complex slideRegistry Logic
**Cause**: Trying to map DOM elements to logical slides during loop transitions
**Solution**: Use `slidesInView()` and avoid internal APIs when possible

## How Embla Loop Mode Actually Works (CRITICAL FOR PLUGINS)

### Key Discovery: No DOM Cloning!
Unlike many carousel libraries, Embla does NOT create DOM clones for infinite loops:
- **Transform-Based**: Uses `translateX/translateY` to reposition existing slides
- **Same DOM Elements**: `slideNodes()` returns the same physical elements
- **Performance**: Much faster than DOM cloning approach
- **slideRegistry**: Maps DOM elements to logical positions (AVOID - complex!)

### Loop-Safe Plugin Patterns

#### ✅ SAFE Approach
```typescript
function applyEffects(): void {
  const slidesInView = emblaApi.slidesInView();
  const centerIndex = slidesInView[Math.floor(slidesInView.length / 2)];
  
  slides.forEach((slide, index) => {
    const scale = index === centerIndex ? 1.1 : 0.9;
    slide.style.transform = `scale(${scale})`; // Safe visual transform
  });
}
```

#### ❌ DANGEROUS Approach  
```typescript
// BREAKS LOOP MODE!
const slideIndex = emblaApi.internalEngine().slideRegistry.findIndex(registry => 
  registry.includes(slideElementIndex)
);
```

### Event Safety in Loop Mode
- **`select`**: ✅ SAFEST - fires when snap changes, stable state
- **`settle`**: ✅ Safe - fires after scroll completes  
- **`reInit`**: ✅ Safe - for setup/cleanup
- **`scroll`**: ⚠️ DANGEROUS - fires during transform repositioning, avoid layout changes

### Why Plugins Break Loops
1. **slideRegistry Usage**: Complex mapping breaks during repositioning
2. **Scroll Event Interference**: Applying effects during transform updates
3. **Position Assumptions**: Assuming fixed DOM-to-logical mapping

## Testing Checklist

- [ ] Plugin works with `loop: true`
- [ ] Plugin works with `loop: false` 
- [ ] No empty slots during transitions
- [ ] Smooth infinite scrolling maintained
- [ ] Works with different slide counts (1, 2, 3, 10+)
- [ ] Proper cleanup in destroy() method
- [ ] No console errors during loop transitions
- [ ] Uses `slidesInView()` instead of slideRegistry
- [ ] Only applies visual transforms (scale, rotate, opacity)
- [ ] Avoids scroll event for layout changes