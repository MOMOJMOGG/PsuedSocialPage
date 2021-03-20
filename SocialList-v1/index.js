// ***************************************************************************** Parameters
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const friends = []
const dataPanel = document.querySelector('#data-panel')

// ***************************************************************************** Function
/*** Modal 顯示 ***/
function showUserModal(id) {
  function matchIdFromList(user) {
    return user.id === id
  }

  const userAvatar = document.querySelector('#user-avatar')
  const userInfo = document.querySelector('#user-info')

  const targetUser = friends.find(matchIdFromList)

  userAvatar.src = targetUser.avatar
  const contentHTML = `
      <li>Email: ${targetUser.email}</li>
      <li>Gender: ${targetUser.gender}</li>
      <li>Age: ${targetUser.age}</li>
      <li>Region: ${targetUser.region}</li>
      <li>Birthday: ${targetUser.birthday}</li>
  `

  userInfo.innerHTML = contentHTML
}

/*** 放資料進網頁 ***/
function renderFirendList(data) {
  let contentHTML = ``

  data.forEach((item) => {

    contentHTML += `
        <div class="col-4 col-sm-4 col-md-3 col-lg-2">
          <div class="m-1">
            <div class="card">
              <img src="${item.avatar}" class="card-img-top" alt="Fake User" data-toggle="modal" data-target="#user-modal" data-id="${item.id}"/>
              <div class="card-body">
                <h5 class="card-title text-center">${item.name + ' ' + item.surname}</h5>
              </div>
            </div>
          </div>
        </div>
      `
  })

  dataPanel.innerHTML = contentHTML
}

// ***************************************************************************** Event Listener
/*** 監聽 data panel ***/
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.tagName === "IMG") {
    showUserModal(Number(event.target.dataset.id))
  }
})

// 請求資料
axios
  .get(INDEX_URL)
  .then((response) => {
    friends.push(...response.data.results)
    renderFirendList(friends)
    console.log(friends)
  })
  .catch((err) => console.log(err))