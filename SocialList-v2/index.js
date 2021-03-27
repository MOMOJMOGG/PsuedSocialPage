// ***************************************************************************** Parameters
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const DATA_PER_PAGE = 12
const PAGINATOR_MAX = 7
const friends = []
let filteredFriends = []
let displayFriend = NaN

const dataPanel = document.getElementById('data-panel')
const searchInput = document.getElementById('nav-searching-input')
const searchBtn = document.getElementById('nav-searching-btn')
const modal = document.querySelector('.modal')
const paginator = document.getElementById('paginator')
const modalBtnLeft = document.getElementById('modal-btn-left')
const modalBtnRight = document.getElementById('modal-btn-right')
const paginatorBtnLeft = document.getElementById('paginator-btn-left')
const paginatorBtnRight = document.getElementById('paginator-btn-right')

const ELEMENT = {
  paginator: {
    leftPart: `<li class="page-item">
                  <a id="paginator-btn-left" class="page-link" href="#" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                    <span class="sr-only">Previous</span>
                  </a>
                </li>`,
    rightPart: `<li class="page-item">
                  <a id="paginator-btn-right" class="page-link" href="#" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                    <span class="sr-only">Next</span>
                  </a>
                </li>`
  },
  iconEmail: `<i class="fas fa-envelope fa-lg"></i>`,
  iconGender: {
    male: `<i class= "fas fa-male fa-lg" ></i>`,
    female: `<i class="fas fa-female fa-lg"></i>`
  },
  iconAge: `<i class="fas fa-calendar-plus fa-lg"></i>`,
  iconBirthday: `<i class="fas fa-birthday-cake fa-lg"></i>`,
  iconRegion: `<i class="far fa-flag fa-lg"></i>`,
}
// ***************************************************************************** Function
/*** Modal 顯示 ***/
function showUserModal(id) {
  // 初始化 Modal 按鈕
  modalBtnReset()

  // 取得 顯示資料
  const targetUser = friends.find((user) => user.id === id)

  // 更新 Modal 
  const userName = document.getElementById('movie-modal-title')
  const userAvatar = document.getElementById('user-avatar')
  const userInfo = document.getElementById('user-info')

  userName.innerText = `${targetUser.name + ' ' + targetUser.surname}`
  userAvatar.src = targetUser.avatar
  const contentHTML = `
      <li class="list-group-item">${ELEMENT.iconEmail}  Email : ${targetUser.email}</li>
      <li class="list-group-item">${ELEMENT.iconGender.male}${ELEMENT.iconGender.female}  Gender: ${targetUser.gender}</li>
      <li class="list-group-item">${ELEMENT.iconAge}  Age : ${targetUser.age}</li>
      <li class="list-group-item">${ELEMENT.iconRegion}  Region : ${targetUser.region}</li>
      <li class="list-group-item">${ELEMENT.iconBirthday}  Birthday : ${targetUser.birthday}</li>
  `
  userInfo.innerHTML = contentHTML

  // 判斷是否存在於 收藏清單中
  const list = getFromLocalStorage('closeFriends')

  if (list.length !== 0) {
    if (list.some((user) => user.id === id)) {
      $('#modal-btn-remove-favorite').show()
      $('#modal-btn-add-favorite').hide()
    }
  }
}

/*** Modal 按鈕顯示 預設設定 ***/
function modalBtnReset() {
  $('#modal-btn-add-favorite').show()
  $('#modal-btn-remove-favorite').hide()
}

/*** 取得 收藏id清單 ***/
function getFavoriteIdList() {
  const list = getFromLocalStorage('closeFriends')
  const idList = []
  list.forEach((friend) => {
    idList.push(friend.id)
  })
  return idList
}

/*** 放資料進網頁 ***/
function renderFirendList(data) {
  // 取得 收藏id清單
  const favoriteIdList = getFavoriteIdList()
  let contentHTML = ``

  data.forEach((item) => {
    contentHTML += `
                    <div class="col-6 col-sm-4 col-md-3 col-lg-2">
                      <div class="m-1">
                   `
    // 若 使用者在 收藏清單內 添加 .bff 觸發 粉框 css
    if (favoriteIdList.some((favoriteId) => favoriteId === item.id)) {
      contentHTML += `<div class="card bff">`
    } else {
      contentHTML += `<div class="card">`
    }

    contentHTML += `
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

/*** 加入 收藏清單 ***/
function addToFavoriteList() {
  // 錯誤處理 : 無法取得顯示對象 則 跳出函式
  if (displayFriend === NaN) {
    return
  }

  const targetUser = friends.find((user) => user.id === displayFriend)

  // 從 local Storage 取得 收藏清單 資料
  const list = getFromLocalStorage('closeFriends')

  // 錯誤處理 : 重複收藏
  if (list.some((user) => user.id === displayFriend)) {
    return alert('此用戶已在收藏清單中！')
  }

  // 加入 收藏清單 並 更新 local Storage
  list.push(targetUser)
  setToLocalStorage('closeFriends', list)

  // 確認 停留頁面
  const currentPage = Number(getFromLocalStorage('homeCurrentPage'))
  renderFirendList(getDataByPage(currentPage))
}

/*** 刪除 收藏清單 ***/
function RemoveFromFavoriteList() {
  // 錯誤處理 : 無法取得顯示對象 則 跳出函式
  if (displayFriend === NaN) {
    return
  }

  const list = getFromLocalStorage('closeFriends')
  const friendIndex = list.findIndex((user) => user.id === displayFriend)

  // 從 收藏清單 移除用戶
  list.splice(friendIndex, 1)

  // 更新 收藏清單
  setToLocalStorage('closeFriends', list)

  // 確認 停留頁面
  const currentPage = Number(getFromLocalStorage('homeCurrentPage'))
  renderFirendList(getDataByPage(currentPage))
}

/*** 切割部分 資料 ***/
function getDataByPage(page) {
  // 判斷要取 搜尋清單 或是 總清單
  const targetList = filteredFriends.length ? filteredFriends : friends

  // 計算起始 index 
  const startIndex = (page - 1) * DATA_PER_PAGE

  // 回傳切割後的新陣列
  return targetList.slice(startIndex, startIndex + DATA_PER_PAGE)
}

/*** 取得分頁 顯示對象 總數 ***/
function paginatorTargetLength() {
  const targetList = filteredFriends.length ? filteredFriends : friends
  return targetList.length
}

/*** 更新 分頁頁數 畫面 ***/
function renderPaginator(amount) {
  // 分頁數若為0, 不顯示分頁
  if (amount === 0) {
    paginator.innerHTML = ""
    return
  }

  // 計算總頁數
  const numberOfPages = Math.ceil(amount / DATA_PER_PAGE)
  let contentHTML = ''

  // 搜尋狀況 或 總資料狀況
  if (numberOfPages < PAGINATOR_MAX) {
    for (let page = 1; page < numberOfPages; page++) {
      contentHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
  } else {
    const frontPageElement = `<li class="page-item"><a class="page-link" href="#" data-page="1">1...</a></li>`
    const endPageElement = `<li class="page-item"><a class="page-link" href="#" data-page="${numberOfPages}">...${numberOfPages}</a></li>`
    const currentPage = Number(getFromLocalStorage('homeCurrentPage'))
    const pageBeside = Math.floor(PAGINATOR_MAX / 2)
    let pageStart = 1

    // 當下頁數 大於 限制頁數一半
    if (currentPage > (pageStart + pageBeside)) {
      // 添加 首頁分頁
      contentHTML += frontPageElement

      // 當下頁數 屬於倒數幾頁 並 超過限制頁數一半
      if (currentPage > (numberOfPages - pageBeside)) {
        pageStart = numberOfPages - PAGINATOR_MAX + 1
      } else {
        pageStart = currentPage - pageBeside
      }
    } else { // 當下頁數 屬於初始幾頁(未超過限制頁數一半)
      pageStart = 1
    }

    // 計算顯示尾數
    let pageEnd = pageStart + PAGINATOR_MAX

    // 當下頁數 不是第一頁 則添加 前一頁按鈕
    if (currentPage !== 1) {
      contentHTML += ELEMENT.paginator.leftPart
    }

    // 取得顯示頁數
    for (let page = pageStart; page < pageEnd; page++) {
      contentHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }

    // 當下頁數 不是最後一頁 則添加 下一頁按鈕
    if (currentPage !== numberOfPages) {
      contentHTML += ELEMENT.paginator.rightPart
    }

    // 當下頁數 小於 倒數幾頁
    if (currentPage < (numberOfPages - pageBeside)) {
      // 添加 首尾分頁
      contentHTML += endPageElement
    }
  }

  paginator.innerHTML = contentHTML
}

/*** 取得 前一頁數 ***/
function getPreviousPage() {
  // 確認 停留頁面
  let currentPage = Number(getFromLocalStorage('homeCurrentPage'))
  currentPage = (currentPage - 1) > 1 ? (currentPage - 1) : 1
  return currentPage
}

/*** 取得 下一頁數 ***/
function getNextPage() {
  // 確認 停留頁面
  let currentPage = Number(getFromLocalStorage('homeCurrentPage'))
  const totalPages = Math.ceil((friends.length) / DATA_PER_PAGE)
  currentPage = (currentPage + 1) < totalPages ? (currentPage + 1) : totalPages
  return currentPage
}

/*** 從 LocalStorage 取得資料 ***/
function getFromLocalStorage(key) {
  // 判斷是否存在於 收藏清單中
  return JSON.parse(localStorage.getItem(key)) || []
}

/*** 存資料 到 LocalStorage ***/
function setToLocalStorage(key, info) {
  localStorage.setItem(key, JSON.stringify(info))
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
  function findFriend(friend, keyword) {
    const name = `${friend.name + ' ' + friend.surname}`.toLowerCase()
    return name.includes(keyword)
  }

  // 終止元件的預設行為
  event.preventDefault()

  // 取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()

  // 條件篩選
  filteredFriends = friends.filter((friend) => findFriend(friend, keyword))

  // 錯誤處理 : 無符合條件的結果
  if (filteredFriends.length === 0) {
    return alert(`您輸入的關鍵字 : ${keyword} 沒有符合條件的朋友!`)
  }

  // 重新更新 分頁 與 電影清單 至畫面
  renderPaginator(paginatorTargetLength())
  renderFirendList(getDataByPage(1))
  setToLocalStorage('homeCurrentPage', 1)
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

/*** 監聽分頁 按鈕 事件  ***/
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 錯誤處理 : 如果被點擊的不是 a 標籤 則 跳出函式
  if (event.target.tagName !== 'A') return

  let page = NaN

  if (event.target.id === 'paginator-btn-left') {
    page = getPreviousPage()
  } else if (event.target.id === 'paginator-btn-right') {
    page = getNextPage()
  } else {
    //透過 dataset 取得被點擊的頁數
    page = Number(event.target.dataset.page)
    event.target.parentElement
  }

  // 錯誤處理 : 如果無法取得頁數 則 跳出函式
  if (page === NaN) return

  // 暫存當下頁數至 local storage
  setToLocalStorage('homeCurrentPage', page)

  //更新畫面
  renderPaginator(paginatorTargetLength())
  renderFirendList(getDataByPage(page))
})

/*** 監聽 Modal 按鈕關閉 清空設定 ***/
$('.modal').on('hidden.bs.modal', (event) => {
  displayFriend = NaN
})

/*** 監聽 Modal 左按鈕 ***/
$('#modal-btn-left').on('click', (event) => {
  let currentIndex = friends.findIndex((user) => user.id === displayFriend)
  currentIndex = (currentIndex - 1) > 0 ? (currentIndex - 1) : 0
  const targetUser = friends[currentIndex]
  displayFriend = targetUser.id
  showUserModal(displayFriend)

  // 確認 停留頁面
  let currentPage = Number(getFromLocalStorage('homeCurrentPage'))
  const userPage = Math.ceil((currentIndex + 1) / DATA_PER_PAGE)
  if (userPage !== currentPage) {
    setToLocalStorage('homeCurrentPage', userPage)
    renderPaginator(paginatorTargetLength())
    renderFirendList(getDataByPage(userPage))
  }
})

/*** 監聽 Modal 右按鈕 ***/
$('#modal-btn-right').on('click', (event) => {
  let currentIndex = friends.findIndex((user) => user.id === displayFriend)
  currentIndex = (currentIndex + 1) < friends.length ? (currentIndex + 1) : friends.length - 1
  const targetUser = friends[currentIndex]
  displayFriend = targetUser.id
  showUserModal(displayFriend)

  // 確認 停留頁面
  let currentPage = Number(getFromLocalStorage('homeCurrentPage'))
  const userPage = Math.ceil((currentIndex + 1) / DATA_PER_PAGE)
  if (userPage !== currentPage) {
    setToLocalStorage('homeCurrentPage', userPage)
    renderPaginator(paginatorTargetLength())
    renderFirendList(getDataByPage(userPage))
  }
})

// 請求資料
axios
  .get(INDEX_URL)
  .then((response) => {
    // ... 為展開運算子
    friends.push(...response.data.results)
    renderFirendList(friends)

    // 初始更新畫面
    setToLocalStorage('homeCurrentPage', 1)
    renderPaginator(paginatorTargetLength())
    renderFirendList(getDataByPage(1))
  })
  .catch((err) => console.log(err))