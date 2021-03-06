import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { IS_DEV } from '../configs';
import reactotron from '../configs/reactotron';
import reducers from './ducks';
import sagas from './sagas';

const middlewares = [];

const sagaMonitor = IS_DEV ? reactotron.createSagaMonitor() : null;

const sagaMiddleware = createSagaMiddleware({ sagaMonitor });

middlewares.push(sagaMiddleware);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const composer = IS_DEV
  ? composeEnhancers(
    applyMiddleware(...middlewares),
    reactotron.createEnhancer(),
  )
  : compose(applyMiddleware(...middlewares));

const store = createStore(reducers, composer);

sagaMiddleware.run(sagas);

export default store;
