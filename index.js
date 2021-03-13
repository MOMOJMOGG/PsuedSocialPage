const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const friends = []

// 請求資料
axios
  .get(INDEX_URL)
  .then((response) => {
    friends.push(...response.data.results)
    console.log(friends)
  })
  .catch((err) => console.log(err))