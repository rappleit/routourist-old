import { createContext, useReducer } from 'react'

export const SavedRoutesContext = createContext()

export const savedRoutesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SAVEDROUTES': 
      return {
        savedRoutes: action.payload
      }
    case 'CREATE_SAVEDROUTE':
      return {
        savedRoutes: [action.payload, ...state.savedRoutes]
      }
    case 'DELETE_SAVEDROUTE':
      return {
        savedRoutes: state.savedRoutes.filter((sr) => sr._id !== action.payload._id)
      }
    default:
      return state
  }
}

export const SavedRoutesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(savedRoutesReducer, {
    savedRoutes: []
  })

  return (
    <SavedRoutesContext.Provider value={{...state, dispatch}}>
      { children }
    </SavedRoutesContext.Provider>
  )
}