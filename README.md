# Plan-viewer - Running Training Plan Tracker

## Description
Plan-viewer is a web application that helps runners track their training progress for a 10K race program. It provides visual progress tracking, detailed statistics, and weekly session management.

## Features
- 📊 Interactive progress tracking
- 📈 Detailed training statistics
- 📅 Weekly session organization
- 💾 Local storage for progress persistence
- 📱 Responsive design
- 🎯 Session completion tracking

## Project Structure
```
plan-viewer/
├── src/
│   ├── js/
│   │   ├── app.js
│   │   ├── modules/
│   │   │   ├── statistics.js
│   │   │   ├── progressTracker.js
│   │   │   ├── weeklyView.js
│   │   │   └── storage.js
│   │   └── utils/
│   │       └── helpers.js
│   ├── css/
│   │   └── styles.css
│   └── index.html
├── data/
│   └── training-plan.json
├── package.json
└── README.md
```

## Installation
1. Clone the repository:
```bash
git clone https://github.com/onibagg/plan-viewer.git
cd plan-viewer
```

2. Install dependencies (if using a package manager):
```bash
npm install
```

3. Start a local server:
```bash
npx http-server
```

## Usage
1. Open the application in your web browser
2. View your training plan organized by weeks
3. Track your progress by clicking on session dots or checkboxes
4. Monitor your overall progress through the statistics panel

## Technical Details
- Built with vanilla JavaScript using ES6 modules
- Uses localStorage for data persistence
- No external dependencies required
- Follows modern JavaScript best practices

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development
To contribute to this project:

1. Fork the repository
2. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```
3. Commit your changes:
```bash
git commit -m "Add some feature"
```
4. Push to the branch:
```bash
git push origin feature/your-feature-name
```
5. Create a Pull Request

## License
MIT License - see LICENSE file for details

## Author
Gabin Demé

## Acknowledgments
- Design inspired by modern fitness tracking applications
- Built as part of the running training plan project