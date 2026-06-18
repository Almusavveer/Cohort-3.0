# TaskFlow

An interactive single-page application built using pure **HTML**, **Vanilla CSS**, and **DOM APIs** to demonstrate browser rendering processes, attributes vs. properties, and event propagation.

---

## 📖 Key DOM Concepts Explained

Here are explanations of the core browser concepts demonstrated in this project:

### 1. Tokenization
**Tokenization** is the first step of parsing. The browser read raw bytes of HTML text from the server and converts them into distinct tokens based on the HTML5 standard. These tokens include start tags, end tags, attribute names and values, and raw text content.
- *Example*: The tag sequence `<h1>Hello</h1>` is split into:
  - StartTag token: `h1`
  - Character token: `Hello`
  - EndTag token: `h1`

### 2. Parsing
**Parsing** takes the stream of tokens produced during tokenization and processes them according to the rules of the HTML syntax. The HTML parser builds an in-memory document model by processing tokens one by one, managing tag nesting, and handling errors (e.g., tags that weren't closed) to form a structured document graph.

### 3. DOM Tree (Document Object Model Tree)
The **DOM Tree** is the hierarchical tree structure created as a result of parsing the HTML tokens. It represents the logical structure of the document where every HTML element, attribute, and text snippet becomes a Node object in memory. JavaScript code utilizes DOM APIs (such as `document.createElement` and `parent.appendChild`) to interact with and alter this tree at runtime.

### 4. CSSOM Tree (CSS Object Model Tree)
While parsing HTML, the browser encounters stylesheet links or `<style>` blocks and builds the **CSSOM Tree**. This is a tree structure representing the parsed style rules and their hierarchical inheritance cascading relationships. Each node in the CSSOM tree contains style rules mapped directly to elements.

### 5. Render Tree
The **Render Tree** is formed by combining the DOM Tree and the CSSOM Tree. It maps only the visible elements that will be printed on screen. 
- *Crucial note*: Elements styled with `display: none` (and their descendants) are excluded from the Render tree entirely because they don't occupy layout space. However, elements styled with `visibility: hidden` are included since they still occupy physical geometry.

### 6. Event Bubbling
**Event Bubbling** is the propagation phase where an event, after reaching its target element, travels *upward* through its ancestors back to the root of the document tree (e.g., Target -> Parent -> Grandparent -> body -> html -> Document -> Window). 
- By default, event listeners are registered in the Bubbling phase unless specified otherwise.
- *Visual Sequence*: `Child Button` ➔ `Parent Container` ➔ `Grandparent Container`.

### 7. Event Capturing (Trickling)
**Event Capturing** is the initial propagation phase. When an event fires, it starts at the top-level root (Window) and trickles *downward* through the ancestor tree to find the target element.
- Registered by setting the `useCapture` parameter to `true` (i.e. `element.addEventListener(type, listener, true)`).
- *Visual Sequence*: `Grandparent Container` ➔ `Parent Container` ➔ `Child Button`.

### 8. Event Delegation
**Event Delegation** is a design pattern that leverages event bubbling. Instead of attaching separate event handlers to multiple individual child elements (like every task card or button), you register a single event listener on a common parent/grandparent container. When a child element is clicked, the click event bubbles up to the parent container, which intercepts it, examines the `event.target` using helper methods like `closest()`, and executes the correct handler.
- *Benefits*: Dramatically reduces memory usage (one listener vs. hundreds) and automatically handles dynamic elements inserted or removed after page load.

---
