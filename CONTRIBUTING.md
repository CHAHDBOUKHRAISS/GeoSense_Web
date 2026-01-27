# Contributing to GeoSense Web

Thank you for your interest in contributing to GeoSense Web! We welcome contributions from the  and open-source community to improve the accuracy and capabilities of our climate reasoning engine.

## How to Contribute

### Reporting Bugs

If you encounter an issue, please verify that it hasn't already been reported. When filing a new issue, please include:
- A clear title and description.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Any relevant logs or screenshots.

### Suggesting Enhancements

Feature requests and improvements are welcome, particularly those that strengthen the scientific robustness or usability of the system.

When proposing enhancements:

-  Clearly describe the problem being addressed

-  Explain the scientific or technical rationale

-  Reference peer-reviewed sources or reputable scientific material when modifying climate-related logic

Proposals lacking a clear theoretical or practical justification may be declined.
### Pull Requests

1.  Fork the repository.
2.  Create a new branch for your feature or fix: `git checkout -b feature/your-feature-name`.
3.  Commit your changes with clear, descriptive messages.
4.  Ensure your code follows the project's coding standards and includes comments explaining complex logic.
5.  Push your branch and submit a Pull Request.

## Coding Standards

-   **Backend**: TypeScript, strict typing, functional purity where possible for reasoning logic.
-   **Frontend**: React, component-based architecture, separation of presentation and logic.
-   **Documentation**: All new features must include updated documentation.

## Scientific & Academic Integrity

GeoSense Web is a scientific tool. As such:

 - Changes to core reasoning components (e.g. server/routes.ts or related modules) must be:

    - **Deterministic**

    - **Reproducible**

    - **Grounded in established scientific theory**

 - Any new climate indices, models, or analytical rules must include:

    - **Proper citations to peer-reviewed literature or authoritative scientific sources**

    -**A brief explanation of assumptions and limitations**

    -**Contributions that introduce non-verifiable, speculative, or non-deterministic behavior will not be accepted.**


## Scientific & Academic Integrity

Final decisions regarding issues, pull requests, and project direction rest with the project maintainer.