import { createApp, h, provide } from 'vue'
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split
} from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { WebSocketLink } from '@apollo/client/link/ws'
import typeDefs from './graphql/typedefs.gql'
import FAVORITE_BOOKS_QUERY from './graphql/favoriteBooks.query.gql'

import './style.css'
import App from './App.vue'
import { getMainDefinition } from '@apollo/client/utilities'

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true
  }
})

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
})

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)
const cache = new InMemoryCache()

// initialize the favorite books cache
cache.writeQuery({
  query: FAVORITE_BOOKS_QUERY,
  data: {
    favoriteBooks: [
      {
        __typename: 'Book',
        id: 123,
        title: 'My Book',
        rating: 5
      }
    ]
  }
})

const resolvers = {
  Mutation: {
    addBookToFavorites: (_, { book }, { cache }) => {
      const data = cache.readQuery({ query: FAVORITE_BOOKS_QUERY })
      const newData = {
        favoriteBooks: [...data.favoriteBooks, book]
      }
      cache.writeQuery({ query: FAVORITE_BOOKS_QUERY, data: newData })
      return newData.favoriteBooks
    },
  }
}
const apolloClient = new ApolloClient({
  link,
  cache,
  typeDefs,
  resolvers
})

//apolloClient
//  .query({
//    query: ALL_BOOKS_QUERY,
//  })
//  .then(res => {
//    console.log(res)
//  })
//

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})

app.mount('#app')
