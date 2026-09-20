const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AGRICYCLE backend running' });
});

app.post('/api/residue/calculate', (req, res) => {
  const { crop, harvestQuantityKg } = req.body;
  // Simple mock: if 5000kg, return 3500kg
  res.json({
    residueType: crop === 'rice' ? 'Rice Straw' : 'Crop Residue',
    estimatedQuantity: harvestQuantityKg * 0.7, // 3500 for 5000
    environmentalImpact: { co2EmissionsAvoided: 5000 }
  });
});

app.get('/api/buyers', (req, res) => {
  res.json([{ id: 1, name: 'Eco Fuels Ltd', location: 'Chennai' }]);
});

app.post('/api/buyers/match', (req, res) => {
  res.json({
    matches: [
      {
        id: 'buyer1',
        name: 'Eco Fuels Ltd',
        location: 'Chennai',
        requiredResidues: ['Rice Straw'],
        offeredPricePerQuintal: 300, // 3 rs/kg = 300 rs/quintal
        distance: 150,
        industryType: 'Biomass Fuel',
        matchScore: 98
      }
    ]
  });
});

app.post('/api/transport/calculate', (req, res) => {
  // Return fixed mock values based on prompt
  res.json({
    distanceKm: 150,
    estimatedCost: 375
  });
});

app.post('/api/opportunities/analyze', (req, res) => {
  res.json({
    grossValue: 10500,
    transportCost: 375,
    handlingCost: 525,
    totalCosts: 900,
    netValue: 9600,
    quantity: 3500
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
