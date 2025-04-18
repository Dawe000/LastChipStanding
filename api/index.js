const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  // Only handle the root path
  if (req.url === '/' || req.url === '') {
    try {
      // Provide full path to the landing page
      const landingPath = path.join(process.cwd(), 'public', 'landing.html');
      
      // Read the HTML file
      const content = fs.readFileSync(landingPath, 'utf8');
      
      // Set the content type
      res.setHeader('Content-Type', 'text/html');
      
      // Send the landing page
      return res.status(200).send(content);
    } catch (error) {
      console.error("Error serving landing page:", error);
      return res.status(500).send("Error loading landing page");
    }
  }

  // For all other requests
  res.status(404).json({ error: 'Not Found' });
}