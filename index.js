const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const friends = []
const dataPanel = document.querySelector('#data-panel')

// 放資料進網頁
function renderFirendList(data) {
  let contentHTML = ``

  data.forEach((item) => {

    contentHTML += `
        <div class="col-2">
          <div class="m-1">
            <div class="card" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
              <img src="${item.avatar}" class="card-img-top" alt="Fake User" />
              <div class="card-body">
                <h5 class="card-title text-center">${item.name + item.surname}</h5>
              </div>
            </div>
          </div>
        </div>
      `
  })

  dataPanel.innerHTML = contentHTML
}

// 請求資料
axios
  .get(INDEX_URL)
  .then((response) => {
    friends.push(...response.data.results)
    renderFirendList(friends)
  })
  .catch((err) => console.log(err))