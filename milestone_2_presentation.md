# Milestone 2 Presentation Script

This document contains the presenter script for each slide in the **Milestone 2: Gesture Recognition & Assessment** PowerPoint presentation (`milestone_2_presentation.pptx`). Use this script to guide your speaking points during the presentation.

---

## Slide 1: Title Slide
*   **Visuals**: Clean title layout showing "SignLingo-AI: Milestone 2" and "Real-Time Gesture Recognition & Sign Language Assessment".
*   **Presenter Script**:
    > "Hello everyone. Today, I am excited to present the completion of Milestone 2 for SignLingo-AI, which focuses on Gesture Recognition and Sign Language Assessment. 
    > In this milestone, we transition from static layouts to an interactive, real-time feedback system. We have successfully established a client-side hand and body tracking pipeline, a backend WebSockets server to ingest high-frequency coordinates, and an intelligent assessment engine that evaluates user movements against ASL templates. Let's walk through how this was achieved."

---

## Slide 2: Objectives & Scope
*   **Visuals**: Bullet points detailing real-time tracking, dynamic assessments, storage ingestion, and HUD alerts.
*   **Presenter Script**:
    > "For Milestone 2, our core objectives were divided into four main areas. 
    > First, we wanted to capture hand and body coordinates directly in the browser without server lag. 
    > Second, we needed to build backend algorithms capable of comparing static hand shapes and dynamic motion sequences. 
    > Third, we wanted to persist user practice histories, including the raw coordinates trails, for review. 
    > And finally, we aimed to display real-time accuracy scores and descriptive joint correction alerts in a premium HUD interface to help learners adjust their postures instantly."

---

## Slide 3: System Architecture & Data Pipelines
*   **Visuals**: Mermaid diagram mapping the flow from Webcam -> MediaPipe -> WebSockets -> Session Deque -> Assessment Engine -> Database.
*   **Presenter Script**:
    > "This slide outlines our system architecture and data pipelines. 
    > The pipeline starts with the webcam feed in the React frontend. Frames are processed client-side by MediaPipe WebAssembly modules. The resulting coordinates are streamed at high-frequency over a persistent WebSocket channel to our FastAPI backend.
    > The backend buffers these frames in a rolling deque. When the user stops recording, the session manager feeds the buffered sequence into the Assessment Engine, which loads templates from cache, calculates similarity scores, logs the attempt to the database, and returns the evaluation result immediately to the client."

---

## Slide 4: Frontend Tracking & UI Features
*   **Visuals**: Details about the canvas overlays, joint color codes, coordinate mirroring, camera toggles, and dropdown selectors.
*   **Presenter Script**:
    > "Our frontend Practice Sandbox interface introduces several premium features. 
    > We built a custom HTML5 Canvas overlay that draws cobalt-blue hand bones and emerald-green joint dots, along with violet indicators representing body shoulders, elbows, and arm movements. 
    > To align the overlay with the mirrored camera display, we applied coordinate mirroring math on the canvas. 
    > We also built an on-demand camera toggle button that closes the media stream and displays a custom placeholder when deactivated, saving system resources. 
    > Finally, we expanded the selector dropdown to support the complete A-to-Z alphabet and 13 dynamic signs."

---

## Slide 5: AI Pattern Recognition & Assessment Models
*   **Visuals**: Algorithms list (Cosine Similarity, Procrustes, Dynamic Time Warping (DTW), Joint Vector checks).
*   **Presenter Script**:
    > "At the heart of the assessment backend are our pattern recognition models. 
    > For static letters, we combine Cosine Similarity, which compares joint vector directions relative to the wrist, and Procrustes Shape Analysis, which measures the structural distance between shapes after normalizing them for scale and rotation.
    > For dynamic words, we use Dynamic Time Warping (DTW) to align frame sequences of variable speeds and lengths.
    > Additionally, we built a finger-pointing angle check. If a user's attempt scores below 80%, the system compares individual finger pointing vectors (MCP to Tip) to the reference template to tell the user exactly which finger needs adjustment."

---

## Slide 6: Database Architecture & SQLite Fallbacks
*   **Visuals**: ER Diagram showing users, profiles, and attempt_logs. Bullet points on SQLite fallback and auto-migrations.
*   **Presenter Script**:
    > "Our storage layer is designed for both scale and portability. 
    > We added the `AttemptLog` model, which records the score, timestamp, correctness, duration, and corrective feedback of each practice attempt. Crucially, it stores the entire trace of coordinates in a JSON column for historical review.
    > To make local deployment seamless, the database router automatically checks if PostgreSQL is active. If PostgreSQL is offline, it cleanly falls back to a local SQLite database and runs all migrations and table instantiations automatically."

---

## Slide 7: Testing, Simulation & Verification Pipelines
*   **Visuals**: Automated Pytest suites, template validators, and DTW stream simulations.
*   **Presenter Script**:
    > "To guarantee code quality and pipeline stability, we built a three-layer verification suite. 
    > First, we have an automated Pytest suite covering auth gateways and WebSocket loops, achieving 100% passing tests. 
    > Second, we wrote a template loader script to verify that our JSON coordinate databases are parsed correctly into memory. 
    > Third, we created an automated simulation script that streams actual reference coordinates frame-by-frame to the WebSocket, confirming that the assessment engine correctly registers a 100% score for a perfect match. 
    > The frontend compiles successfully using Vite."

---

## Slide 8: Technical Challenges Faced & Overcome
*   **Visuals**: Emscripten thread clashing, mirrored coordinate alignment, numpy JSON serialization, and Procrustes singular exceptions.
*   **Presenter Script**:
    > "During development, we solved several critical engineering challenges. 
    > Running MediaPipe Hands and Pose concurrently on the main thread crashed WebAssembly due to Emscripten namespace collisions. We resolved this by executing the models sequentially within the animation frame loop.
    > We also fixed canvas misalignment by mirroring the draw coordinates to match CSS camera flips. 
    > For backend communication, we resolved WebSocket serialization errors by casting NumPy data types into native Python types, and wrapped Procrustes calculations in try-except guards to prevent crashes from degenerate shapes."

---

## Slide 9: Outcomes & Deliverables Summary
*   **Visuals**: Outcomes summary checklist (Interactive sandbox, assessment engine, untracked local configurations, passing tests).
*   **Presenter Script**:
    > "In summary, all outcomes for Milestone 2 have been achieved. 
    > We have a fully functional Practice Sandbox with real-time hand-body overlays, accuracy wheels, and on/off camera buttons. 
    > The assessment engine handles static shapes and dynamic movements smoothly. 
    > The codebase is clean, tested, and all changes have been committed and pushed to the remote repository. 
    > Furthermore, we untracked local configurations and credentials from Git, keeping the public repository safe and secure."

---

## Slide 10: Milestone 3 Roadmap: Looking Ahead
*   **Visuals**: Bullet points detailing gamified interactive practice, historical analytics dashboards, and expanded reference dictionaries. Explicit call to action statement.
*   **Presenter Script**:
    > "Finally, let's look ahead to Milestone 3, which focuses on Interactive Practice & Advanced Analytics. 
    > In this upcoming phase, we will expand the system to include gamified practice modules, adaptive learning pathways, and visual statistics dashboards displaying time spent, attempt counts, and historical accuracy progress.
    > As a call to action, I will implement and execute all Milestone 3 features to build a complete, state-of-the-art sign language learning experience. Thank you, and I am now happy to take any questions."

