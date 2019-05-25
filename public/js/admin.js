const mapClassNameToDbName = (className) => {
  switch(className) {
    case 'username-col': return 'username';
    case 'bio-col': return 'bio';
    case 'title-col': return 'title';
    case 'image-col': return 'url';
    default: return '';
  }
}

const showPopup = (username) => {
  document.getElementById('delete-user-input').value = username;
  document.getElementById('confirm-delete').innerHTML = `You are about to delete user '${username}'.`;
  document.getElementById('popup').classList.remove('hide');
  document.getElementById('greyout').classList.remove('hide');
}

const hidePopup = () => {
  showPopup("");
  document.getElementById('popup').classList.add('hide');
  document.getElementById('greyout').classList.add('hide');
}

document.querySelectorAll('.users-table td')
  .forEach(el => el.addEventListener('click', function(e) {
    const col = mapClassNameToDbName(this.className);
    const row = this.parentElement.id;
    showPopup(row);
  }));

document.querySelectorAll('.users-table tr')
  .forEach(el => el.addEventListener("mouseenter", function(e) {
    this.classList.add('hovered');
  }));

document.querySelectorAll('.users-table tr')
  .forEach(el => el.addEventListener("mouseleave", function(e) {
    this.classList.remove('hovered');
  }));

document.getElementById('greyout')
  .addEventListener('click', hidePopup);