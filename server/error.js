function handleError(err, res, template) {
  // catch any custom built error objects
  if ('code' in err && 'text' in err) {
    res.status(err.code)
      .render(template, { error: `${err.code}: ${err.text}` });
    console.log(`Error '${template}' ${err.code}: ${err.text}`)
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