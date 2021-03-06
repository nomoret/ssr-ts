import { AppProps, AppContext } from "next/app";
import Head from "next/head";
import AppLayout from "../components/AppLayout";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../theme/theme";

import withRedux from "next-redux-wrapper";
import withReduxSaga from "next-redux-saga";
import { applyMiddleware, compose, createStore, Store } from "redux";
import { Provider } from "react-redux";
import createSagaMiddleware from "redux-saga";

import reducer from "../reducers";
import rootSaga from "../sagas";

import axios from "axios";
import { LOAD_USER_REQUEST } from "../reducers/user";

interface MyAppProps extends AppProps {
  store: any;
}

const MyApp = ({ Component, store, pageProps, router }: MyAppProps) => {
  const url = router.route;

  return (
    <>
      <Head>
        <title>{`Title - ${url === "/" ? "home" : url}`}</title>
      </Head>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <AppLayout>
            <CssBaseline />
            <Component {...pageProps} />
          </AppLayout>
        </Provider>
      </ThemeProvider>
    </>
  );
};

MyApp.getInitialProps = async (context: AppContext) => {
  const { ctx, Component } = context;
  let pageProps = {};

  const state = ctx.store.getState();
  const cookie = ctx.isServer ? ctx.req?.headers.cookie : "";

  if (ctx.isServer) {
    axios.defaults.headers.Cookie = "";
  }

  if (ctx.isServer && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }

  if (!state.user.me) {
    ctx.store.dispatch({
      type: LOAD_USER_REQUEST
    });
  }

  if (Component.getInitialProps) {
    pageProps = (await Component.getInitialProps(ctx)) || {};
  }

  return { pageProps };
};

const configureStore = (initialState: any, options: any) => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware];
  const enhancer =
    process.env.NODE_ENV === "production"
      ? compose(applyMiddleware(...middlewares))
      : compose(
          applyMiddleware(...middlewares),
          !options.isServer &&
            typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== "undefined"
            ? window.__REDUX_DEVTOOLS_EXTENSION__()
            : (f: Function) => f
        );
  const store: any = createStore(reducer, initialState, enhancer);
  store.sagaTask = sagaMiddleware.run(rootSaga);
  return store;
};

export default withRedux(configureStore)(withReduxSaga(MyApp));
