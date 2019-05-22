const axios = require('axios');

const keys = require('./../keys').imgur;

const upload = (coverPhoto) => {
  return new Promise((resolve, reject) => {
    let data = {
      image: coverPhoto.encoded,
      album: keys.album,
      type: 'base64'
    };
  
    let config = {
      headers: {
        Authorization: `Client-ID ${keys.clientId}`
      }
    };
  
    axios.post(`https://api.imgur.com/3/upload`, data, config)
      .then(response => {
        let imageUrl = response.data.data.link;
        if (!imageUrl) {
          return reject('Upload Error, missing image URL on response');
        }
        resolve(imageUrl);
      })
      .catch(e => {
        reject(`Upload Error ${e.response.status}: ${e.response.statusText}`);
      });
  });
}

module.exports = {
  upload
};