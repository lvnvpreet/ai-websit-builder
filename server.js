// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const morgan = require('morgan');

// Import routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require('./routes/profileRoutes');
// const websiteRoutes = require('./routes/websiteRoutes');
// const apiRoutes = require('./routes/apiRoutes');
// const pageRoutes = require('./routes/pageRoutes');
// const sectionRoutes = require('./routes/sectionRoutes');
const wizardRoutes = require('./routes/wizardRoutes');
const generationRoutes = require('./routes/generationRoutes');
const previewRoutes = require('./routes/previewRoutes');
const exportRoutes = require('./routes/exportRoutes');

// Import models
const User = require('./models/User');




// Check for required environment variables
if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Log server configuration
console.log('Initializing Website Builder with the following settings:');
console.log(`- Server port: ${port}`);
console.log(`- Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);

// Check if Ollama server URL is configured
// Check if Ollama server URL is configured
if (process.env.OLLAMA_URL) {
  console.log(`- Ollama server URL: ${process.env.OLLAMA_URL}`);
  
  // Optionally, check if Ollama server is reachable
  const ollamaService = require('./services/ollamaService');
  ollamaService.isServerRunning()  // Keep the method attached to the object
    .then(running => {
      if (running) {
        console.log('- Ollama server status: Running');
      } else {
        console.log('- Ollama server status: Not reachable');
      }
    })
    .catch(() => {
      console.log('- Ollama server status: Error checking connection');
    });
} else {
  console.log('- Ollama server URL: Not configured (will use default http://localhost:11434)');
}

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Setting the templating engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
  }),
);

// Make user data available to all templates
app.use(async (req, res, next) => {
  res.locals.user = null;
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        res.locals.user = user;
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  }
  next();
});

// Log errors
app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Add before other routes
app.get('/test-gen', (req, res) => {
  console.log("Test generation route hit");
  res.send("Generation test route is working");
});

// Authentication Routes
app.use(authRoutes);

// Profile Routes
app.use(profileRoutes);

// Website Routes
// app.use(websiteRoutes);

// API Routes
// app.use('/api', apiRoutes);

// Page Routes
// app.use(pageRoutes);

// Section Routes
// app.use(sectionRoutes);

// Wizard Routes
app.use('/wizard', wizardRoutes);

// Generation Routes
app.use(generationRoutes);

// Preview Routes
app.use(previewRoutes);

// Export Routes
app.use(exportRoutes);

// Root path response
app.get("/", (req, res) => {
  res.render("index", {
    user: req.session.userId ? true : false
  });
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).render('error', { 
    message: 'Page not found',
    error: { status: 404 }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).render('error', { 
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});