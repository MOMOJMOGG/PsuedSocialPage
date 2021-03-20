// ***************************************************************************** Parameters
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const friends = JSON.parse(localStorage.getItem('closeFriends'))  // 收藏清單
let filteredFriends = []
let displayFriend = NaN
const dataPanel = document.querySelector('#data-panel')
const searchInput = document.getElementById('nav-searching-input')
const searchBtn = document.getElementById('nav-searching-btn')
const modal = document.querySelector('.modal')
// ***************************************************************************** Function
/*** Modal 顯示 ***/
function showUserModal(id) {
  function matchIdFromList(user) {
    return user.id === id
  }

  modalBtnReset()

  const userName = document.getElementById('movie-modal-title')
  const userAvatar = document.querySelector('#user-avatar')
  const userInfo = document.querySelector('#user-info')

  const targetUser = friends.find(matchIdFromList)

  userName.innerText = `${targetUser.name + ' ' + targetUser.surname}`
  userAvatar.src = targetUser.avatar
  const contentHTML = `
      <li>Email: ${targetUser.email}</li>
      <li>Gender: ${targetUser.gender}</li>
      <li>Age: ${targetUser.age}</li>
      <li>Region: ${targetUser.region}</li>
      <li>Birthday: ${targetUser.birthday}</li>
  `

  userInfo.innerHTML = contentHTML

  // 判斷是否存在於 收藏清單中
  const list = JSON.parse(localStorage.getItem('closeFriends')) || []

  if (list.length !== 0) {
    if (list.some(matchIdFromList)) {
      $('#modal-btn-remove-favorite').show()
      $('#modal-btn-add-favorite').hide()
    }
  }
}

function modalBtnReset() {
  $('#modal-btn-add-favorite').show()
  $('#modal-btn-remove-favorite').hide()
}

$('.modal').on('hidden.bs.modal', (event) => {
  displayFriend = NaN
})

/*** 放資料進網頁 ***/
function renderFirendList(data) {
  let contentHTML = ``

  data.forEach((item) => {

    contentHTML += `
        <div class="col-6 col-sm-4 col-md-3 col-lg-2">
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

/*** 刪除 收藏清單 ***/
function RemoveFromFavoriteList() {
  if (displayFriend === NaN) {
    return
  }

  function matchIdFromList(user) {
    return user.id === displayFriend
  }

  // 從 收藏清單 移除用戶
  const list = JSON.parse(localStorage.getItem('closeFriends')) || []

  let friendIndex = list.findIndex(matchIdFromList)
  list.splice(friendIndex, 1)
  friendIndex = friends.findIndex(matchIdFromList)
  friends.splice(friendIndex, 1)

  localStorage.setItem('closeFriends', JSON.stringify(list))
  $('.modal').modal('toggle')
  renderFirendList(friends)
}
// ***************************************************************************** Event Listener
/*** 監聽 data panel ***/
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.tagName === "IMG") {
    const targetId = Number(event.target.dataset.id)
    showUserModal(targetId)
    displayFriend = targetId
  }
})

/*** 監聽 searching 按鈕 ***/
searchBtn.addEventListener('click', function onSearchBtnClicked(event) {
  // 終止元件的預設行為
  function findFriend(friend, keyword) {
    const name = `${friend.name + ' ' + friend.surname}`.toLowerCase()
    return name.includes(keyword)
  }
  event.preventDefault()

  // 取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()

  // 條件篩選
  filteredFriends = friends.filter((friend) => findFriend(friend, keyword))
  // 錯誤處理 : 無符合條件的結果
  if (filteredFriends.length === 0) {
    return alert(`您輸入的關鍵字 : ${keyword} 沒有符合條件的朋友!`)
  }

  renderFirendList(filteredFriends)
})

/*** 監聽 Modal 按鈕 ***/
modal.addEventListener('click', (event) => {
  const target = event.target
  if (target.id === 'modal-btn-add-favorite') {
    addToFavoriteList()
    $('#modal-btn-remove-favorite').toggle()
    $('#modal-btn-add-favorite').toggle()
  } else if (target.id === 'modal-btn-remove-favorite') {
    RemoveFromFavoriteList()
    $('#modal-btn-add-favorite').toggle()
    $('#modal-btn-remove-favorite').toggle()
  }
})

renderFirendList(friends)