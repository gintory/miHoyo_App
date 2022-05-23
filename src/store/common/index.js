const initialState = {
    //sessionId
    sessionId: ''
  }
  
  export default function commonReducer(state = initialState, action) {
    switch (action.type) {
      case 'updateCommon':
        console.log(action.options);
        return {...state, ...action.options[0]}
      case 'deleteSessionId':
        return {...state, sessionId: ''}
      default:
        return state;
    }
  }
  