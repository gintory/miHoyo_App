import commonReducer from './common/index';
import { combineReducers } from 'redux';

const reducer = combineReducers({ commonState: commonReducer });

export default reducer;
