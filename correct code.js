const express = require('express');
let axios = require('axios');
var app = express();


app.use(express.json());

app.post('/', async function(req, res, next) {
  try {
    if (!Array.isArray(req.body.developers)) {
      return res.status(400).send({ error: 'developers should be an array' });
    }

    let results = await Promise.all(req.body.developers.map(async d => {
      let response = await axios.get(`https://api.github.com/users/${d}`);
      return response.data;
    }));

    let out = results.map(r => ({ name: r.name, bio: r.bio }));

    return res.json(out); 
  } catch (err) {
    next(err);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
