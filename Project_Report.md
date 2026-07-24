# Project Report: BloomBuddy

## 1. Application Overview and Tech Stack
BloomBuddy is a comprehensive, gamified mental wellness and habit-tracking web application. The core philosophy centers around the concept that small daily actions lead to meaningful growth, visually represented by a digital plant that grows alongside the user's consistency.

**Technology Stack:**
* **Frontend Core:** HTML5, CSS3 (leveraging modern features like CSS Variables, Flexbox, and CSS Grid), and Vanilla JavaScript (ES6+).
* **State Management:** The browser's native `localStorage` API serves as the underlying data store, managed by a custom JavaScript wrapper (`DataManager`).
* **Deployment & Hosting:** The application is continuously deployed via **Vercel**, ensuring rapid, globally distributed access via a secure HTTPS URL. *(Note: AWS deployment was bypassed in favor of Vercel's optimized static site hosting capabilities).*
* **AI Tooling (Vibe Coding):** **Gemini 3.1 Pro** was used as the primary AI pair-programmer for code generation, architectural decisions, and CSS debugging.

## 2. Prompting Strategy and Frameworks Used
The development process was heavily driven by "Vibe Coding"—a methodology where an AI model generates the majority of the codebase based on highly specific, iterative prompts from the developer.

**Prompting Strategies:**
* **Role-Playing / Persona Adoption:** Instructed the LLM to act as a Senior UI/UX Designer and Frontend Architect to ensure the generated code adhered to modern best practices (e.g., using semantic HTML and scalable CSS).
* **Iterative Refinement (Chain of Thought):** Rather than asking for an entire application in one prompt, the architecture was built component-by-component. We started with the data schema, moved to the HTML scaffolding, and finished with CSS styling.
* **Contextual Injection:** When prompting for bug fixes, the entire `DataManager` script was provided to the LLM to give it full context on how state was being managed.

**Sample Prompts Used During Development:**
1. *Initial Architecture Prompt:* "Act as a Senior Frontend Developer. I want to build a gamified habit tracker in Vanilla JS without a backend. Write a module called `DataManager` that uses `localStorage`. It needs to define a default User schema with an ID, plant data (type, stage, health), an array of goals, and a streak object. Provide functions to initialize a user, add goals, and calculate streaks."
2. *UI Styling Prompt:* "Now, write the CSS for the dashboard. Use a modern 'glassmorphism' aesthetic with soft shadows, rounded borders (border-radius: 12px), and a calming color palette (sage greens, off-whites). Ensure the layout uses CSS Grid and is fully responsive on mobile devices."
3. *Logic Debugging Prompt:* "There is a bug in the streak calculation. If a user logs in at 11:50 PM and completes a goal, but then logs in the next day at 10:00 AM, the streak is resetting because it's technically less than 24 hours. Rewrite the `checkStreak` function in `data.js` to compare absolute Calendar Dates (Date.toDateString) rather than checking time deltas."

## 3. Phase-by-Phase Development Summary
**Phase 1: Ideation, Scaffolding, and UI Design**
The project began by defining the core mechanic: the plant growth system. We generated the static HTML and CSS for all primary screens (Login, Onboarding, Dashboard, Progress, and Settings). A major focus in this phase was establishing a scalable CSS architecture using CSS Variables for theming (enabling Dark Mode/Light Mode).

**Phase 2: Core Logic and State Management**
With the UI established, development shifted to JavaScript. Because the project omits a backend, managing state across multiple HTML pages became the primary technical hurdle. We developed `data.js` to act as an abstraction layer over `localStorage`, handling data parsing, validation, and serialization.

**Phase 3: Gamification, Logic Algorithms, and Polish**
This phase connected the UI to the data layer. We implemented complex client-side algorithms:
* **Streak Algorithm:** Calculating consecutive days of activity, handling edge cases like midnight rollovers and missed days.
* **Plant Evolution:** Mapping the user's streak data to the plant's growth stage (e.g., a streak > 3 days upgrades the plant from Seed to Sprout).
* **Micro-interactions:** Added toast notifications, custom confirmation modals, and CSS transitions to provide tactile feedback when users check off goals.

**Phase 4: Refinement and Cloud Deployment**
Final testing was conducted across desktop and mobile browsers to ensure responsiveness. The codebase was committed to GitHub and linked to Vercel for live continuous deployment.

## 4. Application Architecture
Because the app relies on a serverless, frontend-only architecture, the separation of concerns is strictly maintained on the client-side:
* **Presentation Layer (HTML/CSS):** Defines the structure and aesthetics.
* **Controller Layer (`app.js`):** Manages DOM manipulation, event listeners, and routing between pages (via `window.location.href`).
* **Data Layer (`data.js`):** The `DataManager` object acts as a localized Singleton. It is imported into every HTML file. When a page loads, it fetches the centralized state, and when a user performs an action (like checking a habit), it immediately mutates the state and serializes it back to `localStorage`.

## 5. Challenges Encountered and Resolutions
* **Challenge 1: State Synchronization Across Pages.** Without a Single Page Application (SPA) framework like React, moving between `dashboard.html` and `settings.html` meant the JavaScript environment was destroyed and recreated. 
  * *Resolution:* By enforcing that all data writes go through `DataManager.saveUser()` and all data reads happen on `DOMContentLoaded`, we ensured that every page always reflected the most up-to-date state from `localStorage`.
* **Challenge 2: Timezone and Midnight Rollover Issues.** Accurately calculating a "daily" streak entirely on the client-side is notoriously difficult due to varying timezones and the fact that a user might not open the app exactly every 24 hours.
  * *Resolution:* We shifted from using `Date.now()` timestamp deltas to using `new Date().toDateString()` comparisons. This ensured the app only cared about calendar days, regardless of the specific hour the user interacted with the app.
* **Challenge 3: Managing Complex CSS Animations via AI Prompts.** Asking the LLM to generate complex, multi-step CSS animations often resulted in broken or jittery code.
  * *Resolution:* We broke down animation requests into atomic prompts (e.g., first requesting a basic fade-in, then in a separate prompt asking to add a Y-axis translation for a slide-up effect).

## 6. Key Learnings and Reflection
* **The Power and Nuance of Vibe Coding:** Utilizing an LLM drastically accelerated the boilerplate and styling phases, reducing development time by an estimated 60%. However, we learned that LLMs struggle with architectural consistency across multiple large files. Acting as a "director" to piece the generated modules together was critical.
* **Vanilla JavaScript Proficiency:** Building a complex state-driven application without React or Vue provided a deep appreciation for the native DOM API. It highlighted that while frameworks offer convenience, native JS is incredibly performant and capable when architected correctly.
* **Future Roadmap:** While `localStorage` proved highly effective for this prototype, it restricts the user to a single device. The logical next phase of this project would involve migrating the `DataManager` logic to a Node.js/Express backend and storing user schemas in a MongoDB or PostgreSQL database, alongside integrating LLM APIs for personalized wellness insights.
