export const authenticate = (data, next) => {
  if (typeof window !== 'undefined') {
    console.log('inside type of window')
    localStorage.setItem('user-enatega', JSON.stringify(data))
    next()
  }
}

export const logout = async next => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user-enatega')
    next()

    // const res = await api.post('/logout');
    // if(res.data) {
    //   next();
    // }

    // return fetch('${api}/api/logout', {
    // 	method: 'GET'
    // }).then(res => {
    // 	console.log('Logout', res);
    // }).catch(err => {
    // 	console.log(err);
    // });
  }
}

export const isAuthenticated = () => {
  if (typeof window == 'undefined') {
    return false
  }
  if (localStorage.getItem('user-enatega')) {
    return JSON.parse(localStorage.getItem('user-enatega'))
  } else {
    return false
  }
}
