const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const routes = require('./routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/v1', routes);
app.use('/uploads', express.static('uploads'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
