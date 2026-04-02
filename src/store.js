// src/store.js
import { createStore } from 'redux'

const initialState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
}

const changeState = (state = initialState, action) => {
  switch (action.type) {
    case 'set':
      return { ...state, ...action }
    default:
      return state
  }
}

const store = createStore(changeState)

export default store