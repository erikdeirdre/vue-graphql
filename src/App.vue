<script>
import { ref, computed } from 'vue'
import EditRating from './components/EditRating.vue'
import AddBook from './components/AddBook.vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import ALL_BOOKS_QUERY from './graphql/allBooks.query.gql'
import FAVORITE_BOOKS_QUERY from './graphql/favoriteBooks.query.gql'
import BOOK_SUBSCRIPTION from './graphql/newBook.subscription.gql'
import ADD_BOOKS_TO_FAVORITES_MUTATION from './graphql/addBookToFavorites.mutation.gql'
export default {
  name: 'App',
  components: {
    EditRating,
    AddBook
  },
  setup() {
    const searchTerm = ref('')
    const activeBook = ref(null)
    const showNewBookForm = ref(false)

    const { result, loading, error, subscribeToMore } = useQuery(
      ALL_BOOKS_QUERY,
      () => ({
        search: searchTerm.value
      }),
// This delays the query execution for half a second. Instead of firing
// everytime the user types.
// Also wait until at least two characters are entered/
      () => ({
        debounce: 500,
//        enabled: searchTerm.value.length > 2
      })
    )

    subscribeToMore(() => ({
      document: BOOK_SUBSCRIPTION,
      updateQuery(previousResult, newResult) {
        const res = {
          allBooks: [
            ...previousResult.allBooks,
            newResult.subscriptionData.data.bookSub
          ]
        }
        return res
      }
    }))

    const books = computed(() => result.value?.allBooks ?? [])

    const { result: favBooksResult} = useQuery(FAVORITE_BOOKS_QUERY)

    const { mutate: addBookToFavorites } = useMutation(
      ADD_BOOKS_TO_FAVORITES_MUTATION
    )
// acts like data option in Vue2?
    return {
      books,
      searchTerm,
      loading,
      error,
      activeBook,
      showNewBookForm,
      favBooksResult,
      addBookToFavorites
    }
  },
}
</script>

<template>
  <div>
    <div>
      <button v-if="!showNewBookForm" @click="showNewBookForm = true">
        Add a new Book
      </button>
      <AddBook v-if="showNewBookForm" :search="searchTerm" @closeForm="showNewBookForm = false" />
    </div>
    <input type="text" v-model="searchTerm" />
    <p v-if="loading">Loading...</p>
    <p v-else-if="error">Something went wrong! Please try again</p>
    <template v-else>
      <p v-if="activeBook">
        Update "{{ activeBook.title }}
        <EditRating
          :initialRating="activeBook.rating"
          :book-id="activeBook.id"
          @closeForm="activeBook = null"
        />
      </p>
      <template v-else>
        <section class="list-wrapper">
          <div class="list">
            <h3>All Books</h3>
            <p v-for="book in books" :key="book.id">
              {{ book.title }} - {{ book.rating }}
              <button @click="activeBook = book">Edit rating</button>
              <button @click="addBookToFavorites({book})">Add to Favorites</button>
            </p>
          </div>
          <div class="list">
            <h3>Favorite Books</h3>
            <p v-for="book in favBooksResult.favoriteBooks" :key="book.id">
              {{ book.title }}
            </p>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.list-wrapper {
  display: flex;
  margin: 0 auto;
  max-width: 960px;
}

.list {
  width: 50%;
}
</style>
