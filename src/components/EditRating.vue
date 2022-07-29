<template>
  <input
    type="text"
    v-model="rating"
    @keyup.enter="updateRating"
    @keyup.esc="$emit('closeForm')"
  />
  <p v-if="loading">Updating...</p>
  <p v-if="error">{{ error }}</p>
</template>

<script>
import { ref } from 'vue'
import UPDATE_BOOK_MUTATION from '../graphql/updateBook.mutation.gql'
import { useMutation } from '@vue/apollo-composable'

export default {
  emits: ['closeForm'],
  props: {
    initialRating: {
      type: Number,
      required: true,
    },
    bookId: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    // we create a local copy of the prop to edit the rating
    const rating = ref(props.initialRating)

// Use a function for the variables to ensure a reactive component updates
// mutate: updateRating stanza links the updateRating event to firing the mutate.
// onDone portion executes when the mutation is complete - response received from the server.
  const { mutate: updateRating, onDone, loading, error } = useMutation(UPDATE_BOOK_MUTATION, () => ({
      variables: {
        id: props.bookId,
// parseFloat as rating.value is a string
        rating: parseFloat(rating.value)
      }
    }))

// Form closes when the mutation returns
    onDone(() => {
      emit('closeForm')
    })

//    const updateRating = () => {
//      mutate()
//      emit('closeForm')
//    }

    return { rating, updateRating, loading, error }
  },
}
</script>
