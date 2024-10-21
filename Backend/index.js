const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(
    cors({
    origin: 'http://localhost:3000',
})
);

app.get('/', (req, res) => {
    res.json({data: "hello"})
});

app.listen(8000);

module.exports = app;