# Embla Carousel Loop Behavior Analysis

## Problem
My ShrinkGrow plugin is breaking the loop behavior. Need to understand how Embla handles loops internally to fix this properly.

## Current Issues
1. Loop transitions show empty slots
2. Carousel "pops" and restarts from beginning
3. Cloned slides don't get proper scaling

## Research Tasks

### 1. How does Embla create loop clones?
- Where are clones created?
- How are they positioned?
- How does slideRegistry work?

### 2. How do official plugins handle loops?
- Check Autoplay plugin loop handling
- Check Fade plugin (though it disables scrolling)
- Look for loop-safe patterns

### 3. What events fire during loop transitions?
- Which events should I listen to?
- Which events should I avoid during loop transitions?

### 4. How does slideNodes() work in loop mode?
- Does it return original + cloned slides?
- How do I map slide DOM elements to original indices?

## Investigation Results

### KEY FINDING: Embla doesn't use DOM clones!
- Embla uses **transform positioning** to reposition existing slides
- No physical DOM elements are cloned  
- Slides are repositioned using `translateX/translateY` transforms
- Much more performant than DOM cloning approach

### How slideNodes() Works in Loop Mode
- Returns same physical DOM elements in original order
- Elements get repositioned via transforms, not cloned
- `slideRegistry` maps DOM elements to logical positions (COMPLEX - AVOID!)

### Safe Plugin Patterns
- Use `slidesInView()` instead of slideRegistry mapping
- Apply only visual transforms: `scale()`, `rotate()`, `opacity`
- NEVER interfere with `translateX/translateY` 
- Listen to `select` event for stable effects, not `scroll`

### Loop Transition Events
- `select`: SAFE - fires when snap changes
- `settle`: SAFE - fires after scroll completes
- `scroll`: DANGEROUS - fires during repositioning, avoid layout changes
- `reInit`: SAFE - for setup/cleanup

## Solution Strategy

1. **Remove slideRegistry Logic**: Stop trying to map DOM elements to original indices
2. **Use slidesInView() Only**: This gives us visible slides regardless of loop state
3. **Apply Visual Transforms Only**: Only `scale()`, never positioning transforms
4. **Listen to Safe Events**: Use `select` instead of `scroll` for scaling effects

### Fixed Plugin Pattern
```typescript
function applyScales(): void {
  const slidesInView = emblaApi.slidesInView();
  const centerIndex = slidesInView[Math.floor(slidesInView.length / 2)];
  
  slides.forEach((slide, index) => {
    const scale = index === centerIndex ? growScale : shrinkScale;
    slide.style.transform = `scale(${scale})`;
  });
}
```

This respects Embla's loop mechanics and only applies safe visual transforms!