function handleError(err, res, template) {
  // catch any custom built error objects
  if ('code' in err && 'text' in err) {
    console.log(`Error '${template}' ${err.code}: ${err.text}`);
    if (err.code == 404) {
      return res.status(404)
        .render('404');
    }
    res.status(err.code)
      .render(template, { error: `${err.code}: ${err.text}` });
  } else {
    res.status(500).send('Server error');
    console.log(err);
  }
}

const newErr = (code, text) => { return { code, text } }

module.exports = {
  handleError,
  newErr
};