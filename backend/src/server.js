require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const statusRoutes = require('./routes/status');
const continentRoutes = require('./routes/continents');
const countryRoutes = require('./routes/countries');
const visaTypeRoutes = require('./routes/visaTypes');
const countryVisaTypeRoutes = require('./routes/countryVisaTypes');
const countryTermsConditionsRoutes = require('./routes/countryTermsConditions');
const visaTermsConditionsRoutes = require('./routes/visaTermsConditions');
const formSectionRoutes = require('./routes/formSections');
const formFieldRoutes = require('./routes/formFields');
const formBuilderRoutes = require('./routes/formBuilder');
const visaFormRoutes = require('./routes/visaForm');
const publicRoutes = require('./routes/public');
const applicationRoutes = require('./routes/applications');
const paymentRoutes = require('./routes/payments');
const customerRoutes = require('./routes/customer');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/continents', continentRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/visa-types', visaTypeRoutes);
app.use('/api/country-visa-types', countryVisaTypeRoutes);
app.use('/api/country-terms-conditions', countryTermsConditionsRoutes);
app.use('/api/visa-terms-conditions', visaTermsConditionsRoutes);
app.use('/api/form-sections', formSectionRoutes);
app.use('/api/form-fields', formFieldRoutes);
app.use('/api/form-builder', formBuilderRoutes);
app.use('/api/visa-form', visaFormRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customer', customerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});