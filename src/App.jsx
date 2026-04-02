import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CSpinner } from "@coreui/react";
import { Toaster } from "react-hot-toast";

const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout.jsx"));
const Login = React.lazy(() => import("./views/pages/login/Login"));
const Register = React.lazy(() => import("./views/pages/register/Register"));
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));

const App = () => {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <Routes>
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/404" element={<Page404 />} />
            <Route exact path="/500" element={<Page500 />} />
            <Route exact path="*" element={<DefaultLayout />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
};

export default App;
