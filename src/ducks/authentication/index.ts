import { Action } from 'redux';
import axios from '../../services/apicontroller';
//to be able to dispatch Errors to the Errorcomponent
import NotificationDuck from '../notification';
import { RootState } from '../../RootState';

/* 
  Follow this pattern!
  * axios (instancefactory)
  * action enum
  * action types
  * action creators
  * reducer functions
  * mainreducer
  * thunk
  * initialStore
 */

//------------------------------

//action enum
enum AuthActions {
  GET_AUTH = 'GET_AUTH',
  GET_AUTH_SUCCESS = 'GET_AUTH_SUCCESS',
  GET_AUTH_FAILURE = 'GET_AUTH_FAILURE', 
  LOGOUT = 'LOGOUT',
}
  //------------------------------

//action Types
type getAuthActionType = { type: string };
type getAuthSuccessActionType = { type: string, auth: Auth};
type getAuthFailureActionType = { type: string, error: Error}; //will error work here as type?
type logOutActionType = { type: string};
//------------------------------

//let the class begin
export default class AuthDuck {
  
  //action creators
  public static getAuthAction = () : getAuthActionType => ({
    type: AuthActions.GET_AUTH,
  })
  public static getAuthSuccessAction = (auth: Auth) : getAuthSuccessActionType => ({
    type: AuthActions.GET_AUTH_SUCCESS,
    auth
  })
  public static getAuthFailureAction = (error: Error) : getAuthFailureActionType => ({
    type: AuthActions.GET_AUTH_FAILURE,
    error
  })
  public static logOutAction = () : logOutActionType => ({
    type: AuthActions.LOGOUT,
  })
  //---------------------------

  //reducer functions
  public static getAuthReducerFunction(state: AuthStore) : AuthStore {
    //react tipp: return a new object of state, respect its immutability do not JSON hack state
    let newState = Object.assign({}, state);
    newState = {
      isLoading: true,
      isSuccess: false,
      Auth: {} as Auth
    };
    return newState;
  }

  public static getAuthSuccessReducerFunction(state: AuthStore, action: getAuthSuccessActionType) : AuthStore {
    let newState = Object.assign({}, state);
    newState = {
      isLoading: false,
      isSuccess: true,
      Auth : action.auth
    };
    return newState;
  }

  public static getAuthFailureReducerFunction(state: AuthStore, action : getAuthFailureActionType) : AuthStore {
    let newState = Object.assign({}, state);
    newState = {
      isLoading: false,
      isSuccess: false,
      Auth : {} as Auth,
      errorMessage: action.error.message
    };
    return newState;
  }
  public static logOutReducerFunction(state: AuthStore) : AuthStore {
    let newState = Object.assign({}, state);
    newState = {
      isLoading: false,
      isSuccess: false,
      Auth : {} as Auth,
    };
    return newState;
  }
  //---------------------------

  //mainreducer, maybe you will write the initialStore before this?
  public static reducer = (state: AuthStore = AuthDuck.getInitialAuthStore(), action: Action<any>) => {
    switch(action.type) {
      case AuthActions.GET_AUTH:
        return AuthDuck.getAuthReducerFunction(state);
      case AuthActions.GET_AUTH_SUCCESS:
        return AuthDuck.getAuthSuccessReducerFunction(state, action as getAuthSuccessActionType);
      case AuthActions.GET_AUTH_FAILURE:
        return AuthDuck.getAuthFailureReducerFunction(state, action as getAuthFailureActionType);
      case AuthActions.LOGOUT:
        return AuthDuck.logOutReducerFunction(state);      
      default:
        return state;
    }
  }
  //---------------------------

  // thunk
  public static getAuth() {
    return function (dispatch: any, getState:() => RootState): Promise<void> {
      //we dispatch here to be set the state to loading
      dispatch(AuthDuck.getAuthAction());
      //we make use of the axios instance
      return axios(getState()).get('/Authentication')
        .then((res) => {
          dispatch(AuthDuck.getAuthSuccessAction(res.data));
         })
        .catch((err: Error) => {
          //inside here we dispatch FailureAction
          //improve this by error component //done
          dispatch(NotificationDuck.throwNotificationWithMessage({text: err.message, title: 'getAuth Error'}));
        });
    };
  }
  public static logOut() {
    return function(dispatch: any) {
      return dispatch(AuthDuck.logOutAction());
    };
  }
  //---------------------------

  //initialState
  public static InitialAuth : Auth = {
    access_token: null, // or better undefined or string if InitialAuth.access_token
    token_type: null,
    expires_in: null,
    username: null,
    firstname: null,
    lastname: null,
    memberid: null,
    email: null,
    ".issued": null,
    ".expires": null,
  };

  public static getInitialAuthStore(): AuthStore | any {
    try {
      //Try to read from localStorage
      const serializedState: string = localStorage.getItem('state') as string;
      const state = JSON.parse(serializedState);
      if (state.AuthStore.Auth.access_token &&
        state.AuthStore.Auth.access_token.length > 0
      ) {
        return state.AuthStore;
      }
    } catch (err) {
      return function(dispatch: any) {
        //abuse dispatch here to throw error
        //how can one test it?
        dispatch(NotificationDuck.throwNotificationWithMessage({title: 'localStorage', text: 'can not access localStorage'}));
      };
    }
    // initialize empty object
    return {
      isLoading: false,
      isSuccess: false,
      Auth: AuthDuck.InitialAuth,
    };
  }
  //---------------------------
 
}

