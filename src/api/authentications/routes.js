const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler
  },
  {
    method: 'POST',
    path: '/authentications/google',
    handler: handler.postFirebaseAuthenticationHandler
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler
  }
]

module.exports = routes
