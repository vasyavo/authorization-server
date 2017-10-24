
module.exports = (req, res, next) => {
    res.status(404);

    if (req.accepts('html')) {
        return res.send('Not found.');
    }

    if (req.accepts('json')) {
        return res.json({ error: 'Not found.' });
    }

    res.type('txt');
    res.send('Not found.');
};
