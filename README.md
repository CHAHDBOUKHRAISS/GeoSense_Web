# GeoSense Web – Regional Climate Analysis and Reasoning Engine

GeoSense Web is a professional decision-support system designed for regional climate analysis. It leverages a deterministic, rule-based reasoning engine to evaluate geographic regions based on multiple climate factors, generating structured diagnostics for Human Comfort, Agriculture Suitability, Solar Energy Potential, and Climate Risk.

## Project Goal

The primary goal is to provide a rigorous, academic tool for analyzing climate data without relying on "black box" machine learning models. The system applies transparent, weighted rules to aggregated climate data to produce actionable insights.

## Features

-   **Interactive Geographic Selection**: Select regions via an interactive map interface (Leaflet).
-   **Multi-Factor Analysis**: Analyze regions based on Temperature, Humidity, Wind Speed, and Atmospheric Pressure.
-   **Configurable Reasoning**: Adjust weights for each climate factor to tailor the analysis to specific needs.
-   **Domain-Specific Modules**:
    -   **Human Comfort**: Thermal comfort indices.
    -   **Agriculture**: Crop suitability based on precipitation, sun, and temperature.
    -   **Solar Potential**: Photovoltaic efficiency estimation.
    -   **Climate Risk**: Assessment of extreme weather event probabilities.
-   **Deterministic Reasoning Engine**: Fully transparent logic for calculating Climate Indices (0-100) and classifications.
-   **Visual Analytics**: Interactive charts (Recharts) visualizing climate trends over selected time periods.
-   **Structured Diagnostics**: Automatic generation of textual diagnoses and recommendations.
-   **Export Capabilities**: Download analysis results in JSON and XML formats.

## Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, React-Leaflet, Recharts.
-   **Backend**: Node.js, Express.js, PostgreSQL (Drizzle ORM).
-   **Architecture**: REST API with clear separation of concerns (Data Layer, Reasoning Layer, Presentation Layer).

## Getting Started

### Prerequisites

-   Node.js (v20+)
-   PostgreSQL

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/geosense-web.git
    cd geosense-web
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env` file (or set in your environment):
    ```
    DATABASE_URL=postgres://user:pass@host:port/dbname
    ```

4.  Push database schema:
    ```bash
    npm run db:push
    ```

5.  Start the development server:
    ```bash
    npm run dev
    ```

## Usage

1.  Open the application in your browser.
2.  Use the **Configuration Panel** on the left to select an analysis type and date range.
3.  Adjust the **Factor Weights** sliders to prioritize specific climate variables.
4.  Select a **Region** from the map.
5.  Click **Run Analysis** to generate the report.
6.  Review the **Climate Index**, **Classification**, and **Textual Diagnosis**.
7.  Export the results if needed.

## Reasoning Engine

The core of GeoSense Web is a deterministic, rule-based reasoning engine designed to provide transparent and reproducible climate analysis. Unlike "black box" machine learning models, this engine operates on explicit, verifiable algorithms that map input climate data to qualitative assessments.

### Key Characteristics

1.  **Deterministic Logic**: The engine uses fixed formulas and thresholds to calculate scores. Given the same input data and weights, the system guarantees the exact same output, ensuring reproducibility—a critical requirement for academic and engineering standards.
2.  **No Machine Learning**: We deliberately avoid probabilistic models (AI/ML) to eliminate hallucinations and lack of explainability. Every diagnosis and recommendation can be traced back to a specific line of code and a specific condition (e.g., "Temperature < 10°C implies heating requirement").
3.  **Weighted Reasoning**: The engine aggregates multiple climate factors (Temperature, Humidity, Wind, Pressure) into a single composite "Climate Index". The influence of each factor is determined by user-configurable weights, allowing the analysis to be tailored for specific domains (e.g., Agriculture prioritizes precipitation, while Solar Energy prioritizes irradiance).
4.  **Explainability**: The system generates a "textual diagnosis" by triggering predefined reasoning statements when specific conditions are met. This ensures that the user understands *why* a region was classified as "Risky" or "Favorable".

This architectural choice prioritizes defensibility, transparency, and the ability to audit the decision-making process, aligning with rigorous engineering principles.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
