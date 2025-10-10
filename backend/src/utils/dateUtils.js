// Utility functions for IST date handling

const toIST = (date) => {
  if (!date) return null;
  const utcDate = new Date(date);
  return new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
};

const fromIST = (dateString) => {
  if (!dateString) return null;
  // Parse datetime-local as IST and convert to UTC
  return new Date(dateString + '+05:30');
};

const formatISTForInput = (date) => {
  if (!date) return '';
  const istDate = toIST(date);
  return istDate.toISOString().slice(0, 16);
};

module.exports = {
  toIST,
  fromIST,
  formatISTForInput
};