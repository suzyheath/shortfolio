let coverPhotoInput = document.getElementById('coverPhoto');
let coverPhotoLabel = coverPhotoInput.nextElementSibling;

coverPhotoInput.addEventListener('change', function(error) {
  if (this.files && this.files.length == 1) {
    console.log('file uploaded');
    coverPhotoLabel.innerText = `Selected: ${this.files[0].name}`;
  }
});