const axios = require('axios');
const keys = require('./../keys').imgur;

const upload = (coverPhoto) => {
  return new Promise((resolve, reject) => {
    let data = {
      image: coverPhoto.encoded,
      album: keys.album,
      type: 'base64',
      name: coverPhoto.name
    };
  
    let config = {
      headers: {
        Authorization: `Client-ID ${keys.clientId}`
      }
    };
  
    axios.post(`https://api.imgur.com/3/upload`, data, config)
      .then(response => {
        let uploadedImage = {
          url: response.data.data.link,
          id: response.data.data.id,
          deleteHash: response.data.data.deletehash
        };
        if (!uploadedImage.url || !uploadedImage.id || !uploadedImage.deleteHash) {
          reject(`Uploaded image missing values ${uploadedImage}`);
        }
        resolve(uploadedImage);
      })
      .catch(e => {
        reject(`Upload Error ${e.response.status}: ${e.response.statusText}`);
      });
  });
}

module.exports = {
  upload
};