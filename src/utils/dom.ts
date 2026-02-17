// src/utils/dom.ts

/**
 * Create an HTML element with optional class, attributes, and children
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string> | null,
  ...children: (string | Node)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'className') {
        el.className = val;
      } else if (key === 'textContent') {
        el.textContent = val;
      } else if (key === 'innerHTML') {
        el.innerHTML = val;
      } else {
        el.setAttribute(key, val);
      }
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }
  return el;
}

/**
 * Shorthand query selector
 */
export function $(selector: string, parent: ParentNode = document): Element | null {
  return parent.querySelector(selector);
}

/**
 * Clear element children and append new ones
 */
export function render(container: Element, ...children: Node[]): void {
  container.innerHTML = '';
  for (const child of children) {
    container.appendChild(child);
  }
}
