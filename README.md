# Kafka Tutorial — Website

A clean, extensible Kafka tutorial website built as a static site. Supports dynamic loading of tutorial pages from a data registry.

## Quick Start

```bash
# Serve locally (any static file server will work)
python3 -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080` in your browser.

## Adding a New Tutorial

1. **Create the content file** — write your tutorial HTML in `tutorials/`:
   ```bash
   touch tutorials/kafka-streams.html
   ```

2. **Register it** — add an entry to `data/tutorials.json`:
   ```json
   {
     "id": "kafka-streams",
     "title": "Kafka Streams",
     "slug": "kafka-streams",
     "description": "Lightweight stream processing with the Kafka Streams API.",
     "file": "tutorials/kafka-streams.html",
     "order": 5
   }
   ```

3. **Write content** — the tutorial HTML auto-loads in the main area with sidebar navigation and prev/next buttons.

## Project Structure

```
kafka-tutorial-openclaw-deepseek-v1/
├── index.html              # Landing page, loads tutorial list
├── data/
│   └── tutorials.json      # Tutorial registry — add entries here
├── tutorials/
│   ├── kafka-intro.html
│   ├── kafka-topics.html
│   ├── kafka-producers.html
│   └── kafka-consumers.html
├── assets/
│   ├── css/
│   │   └── style.css       # Dark-themed design system
│   └── js/
│       └── main.js         # SPA-style navigation, routing
└── README.md
```

## Design Notes

- **Dark theme** — Kafka orange accent (#e25a3a), blue secondary
- **Extensible** — add tutorials by dropping in HTML + JSON entry
- **No build step** — pure HTML/CSS/JS, works with any static server
- **Responsive** — sidebar collapses on mobile
- **Navigation** — sidebar links, next/prev buttons, keyboard-friendly
